package com.vigieauto.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.vigieauto.app.data.AppDatabase
import com.vigieauto.app.data.BackupRepository
import com.vigieauto.app.data.ImportLeaseRegistry
import com.vigieauto.app.domain.migration.RecordFidelity
import com.vigieauto.app.domain.migration.StrictJson
import com.vigieauto.app.domain.model.UndoRestoreResult
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/** Pont fictif PWA beta.18 → Android beta.47/Room → PWA ; l'ancienne version
 * ne connaît pas les corrections et ne journalise pas sa propre modification. */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class OdometerBridge47Test {
    private lateinit var db: AppDatabase
    private lateinit var repo: BackupRepository
    private lateinit var temp: File
    @Before fun setup() {
        db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext<Context>(), AppDatabase::class.java).allowMainThreadQueries().build()
        temp = java.nio.file.Files.createTempDirectory("vigie-compteur-bridge-").toFile()
        repo = BackupRepository(db, temp, ImportLeaseRegistry())
    }
    @After fun cleanup() { db.close(); temp.deleteRecursively() }
    private suspend fun export(): String = ByteArrayOutputStream().also { repo.exportTo(it) }.toString(Charsets.UTF_8.name())
    private fun vehicle(source: String, id: String) = StrictJson.parseObject(source).getAsJsonObject("data").getAsJsonArray("vehicles").first { it.asJsonObject.get("id").asString == id }.asJsonObject

    @Test fun preservesNewCorrectionsThroughRoomEditDeletionAndUndoWithoutInventingOldVersionEvents() = runBlocking {
        val source = File(requireNotNull(System.getProperty("vigie.bridge.odometerInput"))).readText()
        val parsed = StrictJson.parseObject(source).getAsJsonObject("data").getAsJsonArray("vehicles")
        val first = parsed.first { it.asJsonObject.getAsJsonObject("vigieOdometerCorrections")?.get("version")?.asInt == 1 }.asJsonObject
        val future = parsed.first { it.asJsonObject.getAsJsonObject("vigieOdometerCorrections")?.get("version")?.asInt == 99 }.asJsonObject
        val id = first.get("id").asString; val futureId = future.get("id").asString
        val extension = first.get("vigieOdometerCorrections").deepCopy(); val futureExtension = future.get("vigieOdometerCorrections").deepCopy()
        assertEquals(3, extension.asJsonObject.getAsJsonArray("entries").size())
        repo.replace(repo.prepareFromStream(ByteArrayInputStream(source.toByteArray(Charsets.UTF_8))))
        val imported = export()
        assertTrue(RecordFidelity.preserved(extension, vehicle(imported,id).get("vigieOdometerCorrections")))
        assertTrue(RecordFidelity.preserved(futureExtension, vehicle(imported,futureId).get("vigieOdometerCorrections")))
        assertTrue(imported.contains("9007199254740993")); assertFalse(imported.contains("\"9007199254740993\""))
        // beta.47 met à jour le compteur mais ignore cette extension : aucune ligne nouvelle.
        val hash = requireNotNull(db.records().getRecord("vehicles", id)).sha256
        repo.updateVehicleOdometer(id, hash, "94001")
        val edited = export(); assertEquals(94001.0, vehicle(edited,id).get("odometer").asDouble, 0.0)
        assertTrue(RecordFidelity.preserved(extension, vehicle(edited,id).get("vigieOdometerCorrections")))
        val afterHash = requireNotNull(db.records().getRecord("vehicles", id)).sha256
        val undo = repo.deleteVehicle(repo.prepareVehicleDeletion(id, afterHash))
        assertEquals(UndoRestoreResult.RESTORED, repo.restoreJournalUndo(undo.token))
        val result = export()
        assertTrue(RecordFidelity.preserved(extension, vehicle(result,id).get("vigieOdometerCorrections")))
        assertTrue(RecordFidelity.preserved(futureExtension, vehicle(result,futureId).get("vigieOdometerCorrections")))
        assertTrue(result.contains("9007199254740993"))
        File(requireNotNull(System.getProperty("vigie.bridge.odometerOutput"))).writeText(result)
        Unit
    }
}
