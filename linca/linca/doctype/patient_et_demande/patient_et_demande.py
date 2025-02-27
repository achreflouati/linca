import frappe
from frappe.model.document import Document

class Patientetdemande(Document):
    pass

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
