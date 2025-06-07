import frappe
from frappe.model.document import Document

class Patientetdemande(Document):

    
    def on_update(self):
        #frappe.msgprint("on_update")
        user = frappe.session.user

        if self.status == "Avis en cours" and "Doctor" not in frappe.get_roles(user):
            self.status = "Avis à modifier"
          
            self.save(ignore_permissions=True)

        elif self.status == "Avis à modifier" and "Doctor" in frappe.get_roles(user):
            self.custom_modification_count = (self.custom_modification_count or 0) + 1
            self.status = "Avis en cours"
            self.save(ignore_permissions=True)


@frappe.whitelist()  # Permet à la fonction d'être appelée depuis le client
def get_expertise_details(ref):
    """
    Fonction pour récupérer les détails de l'expertise liée à un document 'Patientetdemande'.
    """
    # Effectuer la requête pour récupérer les informations de l'expertise liées à ce 'ref'
    expertise = frappe.get_all(
        'Expert',  # Le doctype 'Expert'
        filters={'ref': ref},  # Filtrer par 'ref'
        fields=['name', 'argumentaire', 'molecule', 'voie', 'dose', 'duree', 'date_rdv', 'surveillance_clinique']
    )
    
    if expertise:
        # Retourner les détails de l'expertise
        return expertise[0]
    else:
        return None