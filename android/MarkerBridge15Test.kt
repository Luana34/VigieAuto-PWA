package com.vigieauto.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.vigieauto.app.data.AppDatabase
import com.vigieauto.app.data.BackupRepository
import com.vigieauto.app.data.ImportLeaseRegistry
import com.vigieauto.app.domain.model.UndoRestoreResult
import com.vigieauto.app.domain.migration.RecordFidelity
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

/** Fixture entièrement fictive PWA -> Room beta.44 -> PWA. Aucun appareil réel. */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class MarkerBridge15Test {
    private lateinit var db: AppDatabase
    private lateinit var repo: BackupRepository
    private lateinit var temp: File
    private suspend fun import(obj: String) { repo.replace(repo.prepareFromStream(ByteArrayInputStream(obj.toByteArray(Charsets.UTF_8)))) }
    private suspend fun export(): String = ByteArrayOutputStream().let { out -> repo.exportTo(out); out.toString(Charsets.UTF_8.name()) }
    private fun data(text: String) = JsonParser.parseString(text).asJsonObject.getAsJsonObject("data")
    private fun vehicle(data: JsonObject): JsonObject = data.getAsJsonArray("vehicles").first { it.asJsonObject.get("id").asString == "0fd9a931-a838-40c6-a7f4-0471b9430eb6" }.asJsonObject
    @Before fun setup() {
        db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext<Context>(), AppDatabase::class.java).allowMainThreadQueries().build()
        temp = java.nio.file.Files.createTempDirectory("vigie-marker-bridge-").toFile()
        repo = BackupRepository(db, temp, ImportLeaseRegistry())
    }
    @After fun cleanup() { db.close(); temp.deleteRecursively() }
    @Test fun pwaMarkerSurvivesImportRoomEditAndExport() = runBlocking {
        val input = File(requireNotNull(System.getenv("VIGIE_MARKER_INPUT")) { "Fournir VIGIE_MARKER_INPUT : export PWA fictif." }).readText()
        assertTrue(input.contains("12345678901234567890.125"))
        val source = data(input); val marker = vehicle(source).getAsJsonObject("vigieVehicleMarker")
        assertEquals(1, marker.get("version").asInt); assertEquals("bleu", marker.get("color").asString)
        import(input)
        val before = data(export())
        assertEquals(marker, vehicle(before).getAsJsonObject("vigieVehicleMarker"))
        val draft = repo.openVehicleEdit(vehicle(before).get("id").asString)
        assertTrue(repo.updateVehicleDetails(draft.copy(notes = "Note fictive modifiée sous Android")))
        val output = export(); val after = data(output)
        assertEquals(marker, vehicle(after).getAsJsonObject("vigieVehicleMarker"))
        assertEquals("Note fictive modifiée sous Android", vehicle(after).get("notes").asString)
        for (name in listOf("services", "fills", "trips", "expenses", "reminders", "symptoms", "templates", "checks", "documents", "currencyAssignments"))
            assertEquals("collection $name", before.get(name), after.get(name))
        assertTrue(output.contains("12345678901234567890.125"))
        val id = vehicle(after).get("id").asString
        val row = requireNotNull(db.records().getRecord("vehicles", id))
        val review = repo.prepareVehicleDeletion(id, row.sha256)
        val pending = repo.deleteVehicle(review)
        assertNull(db.records().getRecord("vehicles", id))
        assertEquals(UndoRestoreResult.RESTORED, repo.restoreJournalUndo(pending.token))
        val restored = export(); val restoredData = data(restored)
        assertTrue("restauration fidèle, repère et données liées compris", RecordFidelity.preserved(after, restoredData))
        assertEquals(marker, vehicle(restoredData).getAsJsonObject("vigieVehicleMarker"))
        assertTrue(restored.contains("12345678901234567890.125"))
        File(requireNotNull(System.getenv("VIGIE_MARKER_OUTPUT")) { "Fournir VIGIE_MARKER_OUTPUT : retour fictif." }).writeText(restored)
    }
}
