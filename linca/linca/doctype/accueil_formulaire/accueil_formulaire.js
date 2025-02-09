frappe.ui.form.on("accueil formulaire", {
    refresh(frm) {
        // Ajouter l'action pour le bouton "Remplir la demande"
        frm.fields_dict["remplir_la_demande"].$wrapper.on("click", function () {
            // Sauvegarder le formulaire automatiquement
            frm.save()
                .then(() => {
                    // Rediriger vers le formulaire "Patient et demande"
                    frappe.new_doc("Patient et demande", {
                        // Passer des champs par défaut si nécessaire
                        // Exemple : nom, ou d'autres valeurs que vous souhaitez transmettre
                        dr: frm.doc.dr,
                        service: frm.doc.service_dexercice_actuel,
                        
                        
                    });
                })
                .catch((err) => {
                    frappe.msgprint(__("Erreur lors de la sauvegarde : " + err));
                });
        });
    },
});
