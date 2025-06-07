import frappe

@frappe.whitelist()
def get_test_template():
    # Récupérer les données envoyées via la requête POST
    doc_data = frappe.request.json.get('doc_data')
    dt = frappe.request.json.get('dt')
    dn = frappe.request.json.get('dn')

    # Vérifier si les valeurs nécessaires ont été passées
    if not doc_data or not dt or not dn:
        frappe.throw("Les données requises (doc_data, dt, dn) sont manquantes dans la requête.")

    # Rendre le template avec les données
    html = frappe.render_template("linca/doctype/patient_et_demande/patient_et_demande_pdf.html", {
        "doc": doc_data,
        "dt": dt,
        "dn": dn
    })
    
    return html  # Retourner le HTML généré
