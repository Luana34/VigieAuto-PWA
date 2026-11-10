/* Test JVM autonome du code métier Android beta.46 existant : pas de Room,
 * pas d'APK et pas d'appareil. L'entrée est une sauvegarde fictive PWA. */
import com.google.gson.JsonParser
import com.vigieauto.app.domain.applyVehicleEdit
import com.vigieauto.app.domain.vehicleEditDraft
import java.io.File

fun main(args: Array<String>) {
    require(args.size == 3) { "Entrée PWA, sortie sans modification du texte, sortie après modification du texte" }
    val root = JsonParser.parseString(File(args[0]).readText(Charsets.UTF_8)).asJsonObject
    val vehicles = root.getAsJsonObject("data").getAsJsonArray("vehicles")
    val index = vehicles.indexOfFirst { it.asJsonObject.has("vigieVehicleNotes") }
    require(index >= 0) { "Aucune note enrichie dans la fixture fictive" }
    val original = vehicles[index].asJsonObject.deepCopy()
    original.getAsJsonObject("vigieVehicleNotes").add("futureFictif", JsonParser.parseString("""{"conserver":true}"""))
    val extension = original.get("vigieVehicleNotes").deepCopy()
    val id = original.get("id").asString
    val initialText = original.get("notes").asString
    val draft = vehicleEditDraft(id, "empreinte-fictive", original)
    check(draft.notes == initialText) { "Le texte n'est pas lu tel quel par Android" }
    val otherEdit = applyVehicleEdit(draft.copy(vin = "VIN-ANDROID-FICTIF"), original)
    check(otherEdit.get("notes").asString == initialText)
    check(otherEdit.get("vigieVehicleNotes") == extension)
    vehicles.set(index, otherEdit)
    File(args[1]).writeText(root.toString(), Charsets.UTF_8)

    val nextDraft = vehicleEditDraft(id, "empreinte-fictive-2", otherEdit)
    val textEdit = applyVehicleEdit(nextDraft.copy(notes = "Modification Android fictive 🚗"), otherEdit)
    check(textEdit.get("notes").asString == "Modification Android fictive 🚗")
    check(textEdit.get("vigieVehicleNotes") == extension) { "Une extension inconnue a été modifiée" }
    vehicles.set(index, textEdit)
    File(args[2]).writeText(root.toString(), Charsets.UTF_8)
    println("✓ Code métier Android beta.46 : texte lisible, modification d'un autre champ et édition de note sans écraser l'extension. Room et appareil non testés.")
}
