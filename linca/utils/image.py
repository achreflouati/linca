# Copyright (c) 2025, ITESlab and contributors
# For license information, please see license.txt

import frappe
import base64
from frappe.model.document import Document
from frappe.utils.file_manager import save_file



@frappe.whitelist()
def upload_image(filedata, filename, docname):
    """Télécharge une image et l'associe au document"""
    if not docname:
        frappe.throw("Le document doit être enregistré avant d'ajouter une image.")

    try:
        # Décoder l'image en base64
        file_content = base64.b64decode(filedata)

        # Sauvegarder l'image dans Frappe
        file_doc = save_file(filename, file_content, "Mise a jour avis", docname, is_private=0)

        # Retourner l'URL de l'image
        return {"file_url": file_doc.file_url}
    except Exception as e:
        frappe.log_error(f"Erreur lors de l'upload d'image: {str(e)}", "Mise a jour avis")
        frappe.throw("Une erreur est survenue lors du téléversement de l'image.")
