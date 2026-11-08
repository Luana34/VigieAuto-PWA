/* Banc JVM isolé uniquement : cette exception correspond à celle de
 * BackupCodec.kt, qu'il n'est pas nécessaire de compiler avec Room ici. */
package com.vigieauto.app.domain
class InvalidBackupException(message: String) : java.io.IOException(message)
