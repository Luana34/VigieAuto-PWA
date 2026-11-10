package com.vigieauto.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.vigieauto.app.data.AppDatabase
import com.vigieauto.app.data.BackupRepository
import com.vigieauto.app.data.ImportLeaseRegistry
import com.vigieauto.app.domain.migration.RecordFidelity
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

/** Aller-retour fictif PWA beta.16 → Android beta.45/Room → PWA. Aucun appareil personnel. */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class VehicleProfileBridge16Test {
    private lateinit var db: AppDatabase
    private lateinit var repo: BackupRepository
    private lateinit var temp: File
    private suspend fun import(text: String) = repo.replace(repo.prepareFromStream(ByteArrayInputStream(text.toByteArray(Charsets.UTF_8))))
    private suspend fun export(): String = ByteArrayOutputStream().let { out -> repo.exportTo(out); out.toString(Charsets.UTF_8.name()) }
    private fun data(text: String) = JsonParser.parseString(text).asJsonObject.getAsJsonObject("data")
    private fun vehicle(data: JsonObject): JsonObject = data.getAsJsonArray("vehicles").first {
        it.asJsonObject.get("id").asString == "0fd9a931-a838-40c6-a7f4-0471b9430eb6"
    }.asJsonObject
    @Before fun setup() {
        db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext<Context>(), AppDatabase::class.java).allowMainThreadQueries().build()
        temp = java.nio.file.Files.createTempDirectory("vigie-profile-bridge-").toFile()
        repo = BackupRepository(db, temp, ImportLeaseRegistry())
    }
    @After fun cleanup() { db.close(); temp.deleteRecursively() }

    @Test fun pwaProfileSurvivesAndroidRoomEditDeletionUndoAndExport() = runBlocking {
        val input = File(requireNotNull(System.getenv("VIGIE_PROFILE_INPUT")) { "Fournir un export PWA fictif." }).readText()
        assertTrue(input.contains("12345678901234567890.125"))
        val source = data(input)
        val profile = vehicle(source).getAsJsonObject("vigieVehicleProfile").deepCopy()
        assertEquals(1, profile.get("version").asInt)
        assertEquals("Gris perle", profile.get("bodyColor").asString)
        assertEquals("12345678901234567890.125", profile.getAsJsonObject("purchase").get("amount").asString)
        assertEquals("CHF", profile.getAsJsonObject("purchase").get("currency").asString)
        import(input)
        val before = data(export())
        assertTrue(RecordFidelity.preserved(profile, vehicle(before).getAsJsonObject("vigieVehicleProfile")))
        val id = vehicle(before).get("id").asString
        val draft = repo.openVehicleEdit(id)
        assertTrue(repo.updateVehicleDetails(draft.copy(notes = "Note fictive modifiée sous Android")))
        val afterText = export(); val after = data(afterText)
        assertTrue(RecordFidelity.preserved(profile, vehicle(after).getAsJsonObject("vigieVehicleProfile")))
        assertEquals("Note fictive modifiée sous Android", vehicle(after).get("notes").asString)
        for (name in listOf("services", "fills", "trips", "expenses", "reminders", "symptoms", "templates", "checks", "documents", "currencyAssignments"))
            assertTrue("collection $name", RecordFidelity.preserved(before.get(name), after.get(name)))
        assertTrue(afterText.contains("12345678901234567890.125"))
        val row = requireNotNull(db.records().getRecord("vehicles", id))
        val pending = repo.deleteVehicle(repo.prepareVehicleDeletion(id, row.sha256))
        assertNull(db.records().getRecord("vehicles", id))
        assertEquals(UndoRestoreResult.RESTORED, repo.restoreJournalUndo(pending.token))
        val restored = export(); val restoredData = data(restored)
        assertTrue(RecordFidelity.preserved(after, restoredData))
        assertTrue(RecordFidelity.preserved(profile, vehicle(restoredData).getAsJsonObject("vigieVehicleProfile")))
        assertTrue(restored.contains("12345678901234567890.125"))
        File(requireNotNull(System.getenv("VIGIE_PROFILE_OUTPUT")) { "Fournir le chemin de retour fictif." }).writeText(restored)
    }
}
