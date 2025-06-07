frappe.ui.form.on("Patient et demande", {
    refresh(frm) {
        if (frm.fields_dict.custom_status_buttons_html) {

            // HTML with style & round buttons
            const html = `
                <style>
                    .active-button {
                        box-shadow: 0 0 12px 4px rgba(0, 0, 0, 0.3);
                        transform: scale(1.1);
                        transition: all 0.2s ease;
                    }
                </style>
                <div style="margin-top: 15px; display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                    <button id="btn-non-urgent" class="btn btn-success"
                        style="width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                        Non urgent
                    </button>
                    <button id="btn-urgent" class="btn btn-warning"
                        style="width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                        Urgent
                    </button>
                    <button id="btn-extreme" class="btn btn-danger"
                        style="width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                        Extrême urgent
                    </button>
                </div>
            `;

            frm.fields_dict.custom_status_buttons_html.$wrapper.html(html);
            const wrapper = frm.fields_dict.custom_status_buttons_html.$wrapper;

            function resetActiveButtons() {
                wrapper.find('button').removeClass('active-button');
            }

            function activateButtonByStatus(status) {
                resetActiveButtons();
                if (status === __('Not Urgent')) {
                    wrapper.find('#btn-non-urgent').addClass('active-button');
                } else if (status === __('Urgent')) {
                    wrapper.find('#btn-urgent').addClass('active-button');
                } else if (status === __('Extremely Urgent')) {
                    wrapper.find('#btn-extreme').addClass('active-button');
                }
            }

            // Activate on opening
            if (!frm.doc.custom_emergency_status) {
                frm.set_value('custom_emergency_status', __('Not Urgent'));
            }
            activateButtonByStatus(frm.doc.custom_emergency_status);

            // Click management
            wrapper.find('#btn-non-urgent').on('click', function () {
                resetActiveButtons();
                $(this).addClass('active-button');
                frm.set_value('custom_emergency_status', __('Not Urgent'));
            });

            wrapper.find('#btn-urgent').on('click', function () {
                resetActiveButtons();
                $(this).addClass('active-button');
                frm.set_value('custom_emergency_status', __('Urgent'));
            });

            wrapper.find('#btn-extreme').on('click', function () {
                resetActiveButtons();
                $(this).addClass('active-button');
                frm.set_value('custom_emergency_status', __('Extrême urgent'));
            });
        }

        // Add CSS dynamically to the page
        const style = `
            .popup-actions {
                display: flex;
                justify-content: center;
                margin-top: auto;
                width: 100%;
                padding-top: 5px;
            }
            
            .popup-actions button {
                padding: 12px 20px;
                border-radius: 6px;
                font-weight: bold;
                color: white;
                border: none;
                cursor: pointer;
                margin: 5px;
            }

            #edit-btn { background-color: #fd7e14; }
            #edit-btn:hover { background-color: #e87719; }

            #export-btn { background-color: #28a745; }
            #export-btn:hover { background-color: #218838; }

            #send-btn { background-color: #ffc107; }
            #send-btn:hover { background-color: #e0a800; }

            #draft-btn { background-color:rgb(82, 82, 85); }
            #draft-btn:hover { background-color:rgb(74, 74, 78); }
        `;

        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = style;
        document.head.appendChild(styleSheet);

        // Select the div containing the "Preview" button
        let customActionsDiv = $('.custom-actions.hidden-xs.hidden-md');

        // Remove hidden classes
        customActionsDiv.removeClass('hidden-xs hidden-md');

        // Ensure the div and its contents are visible
        customActionsDiv.show();

        // Check if the document is in draft state
        if (frm.doc.docstatus === 0) {
            //Add "Preview" button
            if (frm.fields_dict['custom_preview_button']) {
                const styleId = "custom-preview-button-style";

                // Ajouter le style une seule fois
                if (!document.getElementById(styleId)) {
                    const style = document.createElement("style");
                    style.id = styleId;
                    style.innerHTML = `
                        .custom-preview-button {
                            background-color:rgb(142, 157, 167) !important;
                            color: white;
                            padding: 25px 40px !important;
                            border-radius: 10px;
                            font-size: 20px;
                            font-weight: bold;
                            cursor: pointer;
                            text-align: center;
                            width: auto;
                            margin: 25px auto;
                            display: block;
                        }

                        .custom-preview-button-container {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                        }
                    `;
                    document.head.appendChild(style);
                }

                // Ajouter le bouton dans le champ HTML custom_preview_button
                const buttonHtml = `
                    <div class="custom-preview-button-container">
                        <button class="custom-preview-button" id="preview_pdf_btn">${__('Preview Form')}</button>
                    </div>
                `;
                frm.fields_dict['custom_preview_button'].$wrapper.html(buttonHtml);

                // Ajouter l'événement au bouton
                $('#preview_pdf_btn').on('click', function() {
                    let displayPopup = () => {
                        let patientID = frm.doc.name;
                        let dialog = new frappe.ui.Dialog({
                            title: __('Doctor Opinion'),
                            fields: [{ fieldname: "pdf_viewer", fieldtype: "HTML" }],
                            size: 'large'
                        });
                    
                        // Prépare les données à envoyer
                        let data = {
                            doc_data: frm.doc,  // Données du formulaire
                            dt: frm.doc.doctype,
                            dn: frm.doc.name,
                            preview_mode: frm.doc.__islocal ? true : false
                        };

                        // Récupérer le token CSRF depuis le cookie
                        let csrfToken = frappe.csrf_token;  // Côté serveur (Frappe expose ça)
                        if (csrfToken) {
                            // Utiliser fetch() pour faire une requête POST vers l'API Frappe
                            fetch('/api/method/linca.utils.data.get_test_template', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Frappe-CSRF-Token': csrfToken  // Ajouter le token CSRF dans les en-têtes
                                },
                                body: JSON.stringify(data)  // Convertir les données en JSON
                            })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message) {
                                    dialog.fields_dict.pdf_viewer.$wrapper.html(data.message);
                                    dialog.show();
                                    attachButtonEvents();
                                } else {
                                    frappe.msgprint(__('Erreur : Impossible de charger le template.'));
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                frappe.msgprint(__('Erreur : Une erreur est survenue.'));
                            });
                        } else {
                            frappe.msgprint(__('Erreur : Token CSRF manquant.'));
                        }
                    };                    

                    // Fonction pour attacher les événements aux boutons
                    function attachButtonEvents() {
                        setTimeout(() => {
                            $("#send-btn").on("click", () => changeStatus("Avis en cours", __('Le document a été envoyé.')));
                            $("#edit-btn").on("click", () => changeStatus("Avis à modifier", __('Le document est marqué comme à modifier.')));
                            $("#draft-btn").on("click", () => changeStatus("Brouillon", __('Le document a été enregistré en brouillon.')));
                            $("#export-btn").on("click", () => window.open(pdfUrl, '_blank'));
                        }, 500);  // 🔹 Délai pour s'assurer que les boutons sont bien chargés
                    }

                    // Fonction pour changer le statut et enregistrer
                    const changeStatus = (newStatus, messageSuccess) => {
                        frappe.confirm(
                            __('Êtes-vous sûr de vouloir effectuer cette action ?'),
                            () => {
                                frm.set_value("status", newStatus);
                                frm.save().then(() => {
                                    frm.refresh();
                                    frappe.msgprint({
                                        title: __('Succès'),
                                        message: messageSuccess,
                                        indicator: 'green'
                                    });
                                }).catch((err) => {
                                    frappe.msgprint({
                                        title: __('Erreur'),
                                        message: __('Une erreur est survenue lors de l’enregistrement.'),
                                        indicator: 'red'
                                    });
                                    console.error(err);
                                });
                            }
                        );
                    };

                    // Affichage du popup
                    displayPopup();

                }).addClass('btn btn-primary btn-sm primary-action');
            }

            // Check if the current user does not have the "Doctor" role
            if (!frappe.user_roles.includes("Doctor")) {
                // Add "Expertiser" button
                frm.add_custom_button("Expertiser", () => {
                    let dialog_fields = [
                        {
                            label: "Argumentaire",
                            fieldname: "argumentaire",
                            fieldtype: "Small Text",
                            placeholder: "Saisir l'argumentaire"
                        },
                        {
                            label: "Pas d'indication à débuter un traitement anti-infectieux",
                            fieldname: "pas_dindication",
                            fieldtype: "Check",
                            default: 0
                        },
                        {
                            label: "Arrêter un traitement antiinfectieux en cours",
                            fieldname: "arreter_traitement",
                            fieldtype: "Check",
                            default: 0
                        },
                        {
                            label: "Débuter un traitement antiinfectieux",
                            fieldname: "debuter_traitement",
                            fieldtype: "Check",
                            default: 0
                        },
                        {
                            label: "Molécule",
                            fieldname: "molécule",
                            fieldtype: "Select",
                            options: ["Option 1", "Option 2", "Option 3"]
                        },
                        {
                            label: "Voie d'administration",
                            fieldname: "voie",
                            fieldtype: "Select",
                            options: ["Orale", "Intraveineuse", "Autre"]
                        },
                        {
                            label: "Dose",
                            fieldname: "dose",
                            fieldtype: "Data"
                        },
                        {
                            label: "Durée (jours)",
                            fieldname: "duree",
                            fieldtype: "Int"
                        },
                        {
                            label: "Date de Rendez-vous",
                            fieldname: "date_rdv",
                            fieldtype: "Date"
                        },
                        {
                            label: "Surveillance clinique",
                            fieldname: "surveillance_clinique",
                            fieldtype: "Check",
                            default: 0
                        }
                    ];
                    let dialog = new frappe.ui.Dialog({
                        title: "Saisie des informations d'Expertise",
                        fields: dialog_fields,
                            
                        primary_action_label: "Enregistrer",
                        primary_action(values) {
                            frappe.call({
                                method: "frappe.client.insert",
                                args: {
                                    doc: {
                                        doctype: "Expert",
                                        ref: frm.doc.name,
                                        ...values
                                    }
                                },
                                callback: function (response) {
                                    if (!response.exc) {
                                        frappe.msgprint("L'expertise a été enregistrée avec succès !");
                                        dialog.hide();
                                        // Mettre à jour le statut dans le doctype courant
                                frm.set_value("status", "Avis préts");
                                frm.save();
                                    }
                                }
                            });
                            
                        }
                    });
        
                    // Ouvrir la popup
                    dialog.show();
                    /* frappe.confirm(
                        "Êtes-vous sûr de vouloir marquer ce document comme 'Expertise' ?",
                        () => {
                            frm.set_value("status", "Avis préts");
                            frm.save(); // Enregistrer le document pour changer le statut
                            frappe.msgprint("Le document a été marqué comme 'Expertise'.");
                            
                        }
                    ); */
                }).addClass("btn-success");

                // Add "Senioriser" button
                frm.add_custom_button("Sénioriser", () => {
                    frappe.confirm(
                        "Êtes-vous sûr de vouloir marquer ce document comme 'Avis à sénioriser' ?",
                        () => {
                            frm.set_value("status", "Avis à sénioriser");
                            frm.save(); // Enregistrer le document pour changer le statut
                            frappe.msgprint("Le document a été marqué comme 'Avis à sénioriser'.");
                        }
                    );
                }).addClass("btn-secondary");

                // Add "Renvoyer" button
                frm.add_custom_button("Renvoyer", () => {
                    frappe.confirm(
                        "Êtes-vous sûr de vouloir marquer ce document comme 'Avis en cours' ?",
                        () => {
                            frm.set_value("status", "Avis en cours");
                            frm.save(); // Enregistrer le document pour changer le statut
                            frappe.msgprint("Le document a été marqué comme 'Avis en cours'.");
                        }
                    );
                }).addClass("btn-warning");       
            }else{
                //Add "Preview" button
                frm.add_custom_button(__('Preview Form'), function() {
                    let displayPopup = () => {
                        let patientID = frm.doc.name;
                        let dialog = new frappe.ui.Dialog({
                            title: __('Doctor Opinion'),
                            fields: [{ fieldname: "pdf_viewer", fieldtype: "HTML" }],
                            size: 'large'
                        });
                
                        if (frm.is_new()) {
                            // Charger test.html depuis utils/data.py
                            frappe.call({
                                method: "linca.utils.data.get_test_template",  // 🔹 Appel à la fonction Python
                                args: {
                                    doc_data: frm.doc  // Passer les données du formulaire à la fonction
                                },
                                callback: function(response) {
                                    if (response.message) {
                                        let buttons = `
                                            <div class="popup-actions">
                                                <button id="send-btn" class="btn btn-primary">${__('Send')}</button>
                                                <button id="export-btn" class="btn btn-secondary">${__('Export')}</button>
                                                <button id="draft-btn" class="btn btn-warning">${__('Save in draft')}</button>
                                            </div>`;
                
                                        dialog.fields_dict.pdf_viewer.$wrapper.html(response.message + buttons);
                                        dialog.show();
                
                                        // Attacher les événements après l'affichage
                                        attachButtonEvents();
                                    } else {
                                        frappe.msgprint(__('Erreur : Impossible de charger le template.'));
                                    }
                                }
                            });
                        } else {
                            // URL du PDF pour les documents enregistrés
                            const pdfUrl = `/api/method/frappe.utils.print_format.download_pdf?doctype=Patient%20et%20demande&name=${encodeURIComponent(patientID)}&format=Custom%20Doctor%20Notice`;
                
                            let buttons = `
                                <div class="popup-actions">
                                    <button id="send-btn" class="btn btn-primary">${__('Send')}</button>
                                    <button id="edit-btn" class="btn btn-info">${__('Edit')}</button>
                                    <button id="export-btn" class="btn btn-secondary">${__('Export')}</button>
                                </div>`;
                
                            let content = `<iframe src="${pdfUrl}" width="100%" height="500px" style="border: none;"></iframe>` + buttons;
                            dialog.fields_dict.pdf_viewer.$wrapper.html(content);
                            dialog.show();
                
                            // Attacher les événements après l'affichage
                            attachButtonEvents();
                        }
                    };
                
                    // Fonction pour attacher les événements aux boutons
                    function attachButtonEvents() {
                        setTimeout(() => {
                            $("#send-btn").on("click", () => changeStatus("Avis en cours", __('Le document a été envoyé.')));
                            $("#edit-btn").on("click", () => changeStatus("Avis à modifier", __('Le document est marqué comme à modifier.')));
                            $("#draft-btn").on("click", () => changeStatus("Brouillon", __('Le document a été enregistré en brouillon.')));
                            $("#export-btn").on("click", () => window.open(pdfUrl, '_blank'));
                        }, 500);  // 🔹 Délai pour s'assurer que les boutons sont bien chargés
                    }
                
                    // Fonction pour changer le statut et enregistrer
                    const changeStatus = (newStatus, messageSuccess) => {
                        frappe.confirm(
                            __('Êtes-vous sûr de vouloir effectuer cette action ?'),
                            () => {
                                frm.set_value("status", newStatus);
                                frm.save().then(() => {
                                    frm.refresh();
                                    frappe.msgprint({
                                        title: __('Succès'),
                                        message: messageSuccess,
                                        indicator: 'green'
                                    });
                                }).catch((err) => {
                                    frappe.msgprint({
                                        title: __('Erreur'),
                                        message: __('Une erreur est survenue lors de l’enregistrement.'),
                                        indicator: 'red'
                                    });
                                    console.error(err);
                                });
                            }
                        );
                    };
                
                    // Affichage du popup
                    displayPopup();
                
                }).addClass('btn btn-primary btn-sm primary-action');
                                
            }
        }    

        if (frm.fields_dict.custom_image_wound_photo) {
            renderImagePreviewForField(frm, 'custom_image_wound_photo');
        }

        if (frm.fields_dict.custom_radiology_image) {
            renderImagePreviewForField(frm, 'custom_radiology_image');
        }

        if (frm.fields_dict.custom_blood_cultures) {
            renderImagePreviewForTable(frm, 'custom_blood_cultures', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_blood_cultures');
        }
        if (frm.fields_dict.custom_ecbus) {
            renderImagePreviewForTable(frm, 'custom_ecbus', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_ecbus');
        }
        if (frm.fields_dict.custom_lumbar_punctures) {
            renderImagePreviewForTable(frm, 'custom_lumbar_punctures', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_lumbar_punctures');
        }
        if (frm.fields_dict.custom_stool_cultures) {
            renderImagePreviewForTable(frm, 'custom_stool_cultures', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_stool_cultures');
        }
        if (frm.fields_dict.custom_rbks) {
            renderImagePreviewForTable(frm, 'custom_rbks', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_rbks');
        }
        if (frm.fields_dict.custom_eps) {
            renderImagePreviewForTable(frm, 'custom_eps', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_eps');
        }
        if (frm.fields_dict.custom_serologies) {
            renderImagePreviewForTable(frm, 'custom_serologies', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_serologies');
        }
        if (frm.fields_dict.custom_pcrs) {
            renderImagePreviewForTable(frm, 'custom_pcrs', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_pcrs');
        }
        if (frm.fields_dict.custom_ecbcs) {
            renderImagePreviewForTable(frm, 'custom_ecbcs', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_ecbcs');
        }
        if (frm.fields_dict.custom_bal_bronchoalveolar_fluid) {
            renderImagePreviewForTable(frm, 'custom_bal_bronchoalveolar_fluid', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_bal_bronchoalveolar_fluid');
        }
        if (frm.fields_dict.custom_ptp_protected_tracheal_sampling) {
            renderImagePreviewForTable(frm, 'custom_ptp_protected_tracheal_sampling', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_ptp_protected_tracheal_sampling');
        }
        if (frm.fields_dict.custom_superficial_puses) {
            renderImagePreviewForTable(frm, 'custom_superficial_puses', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_superficial_puses');
        }
        if (frm.fields_dict.custom_deep_puses) {
            renderImagePreviewForTable(frm, 'custom_deep_puses', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_deep_puses');
        }
        if (frm.fields_dict.custom_prosthesis_list) {
            renderImagePreviewForTable(frm, 'custom_prosthesis_list', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_prosthesis_list');
        }
        if (frm.fields_dict.custom_devices_kt_probe_) {
            renderImagePreviewForTable(frm, 'custom_devices_kt_probe_', 'antibiogram', 'antibiogram_preview');
            hideGridButtons(frm, 'custom_devices_kt_probe_');
        }
    },
    onload: function(frm) {
        renderSectionTitle(frm, "custom_general_information", "General Information");
        renderSectionTitle(frm, "custom_ground", "Ground");
        renderSectionTitle(frm, "custom_clinical_examination", "Clinical Examination");
        renderSectionTitle(frm, "custom_biology", "Biology");
        renderSectionTitle(frm, "custom_microbiology", "Microbiology");
        renderSectionTitle(frm, "custom_radiology", "Radiology");
        renderSectionTitle(frm, "custom_disease_history", "Disease history");

        if (!frm.doc.__islocal) {
            return;
        }

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "User",
                name: frappe.session.user
            },
            callback: function(r) {
                if (r.message) {
                    let user = r.message;
    
                    frm.set_value("dr", user.full_name || "");
                    frm.set_value("custom_doctor_grade", user.grade || "");
                    frm.set_value("custom_doctor_phone_number", user.phone_number || "");
    
                    // Récupérer le nom1 de l'institution
                    if (user.institution) {
                        frappe.call({
                            method: "frappe.client.get",
                            args: {
                                doctype: "Institution",
                                name: user.institution
                            },
                            callback: function(inst) {
                                if (inst.message) {
                                    frm.set_value("custom_doctor_institution", inst.message.name1 || "");
                                }
                            }
                        });
                    }
    
                    // Récupérer le name1 du service
                    if (user.service) {
                        frappe.call({
                            method: "frappe.client.get",
                            args: {
                                doctype: "Service",
                                name: user.service
                            },
                            callback: function(serv) {
                                if (serv.message) {
                                    frm.set_value("service", serv.message.name1 || "");
                                }
                            }
                        });
                    }
                }
            }
        });

        //Upload multiple images in blood cultures table rows
    },

    validate: function(frm) {
        check_word_limit(frm, 'custom_ecriver_les_données_pertinentes_de_léxamne_physique', 200);
        check_word_limit(frm, 'custom_patient_history', 200);
    },

    //ItesLab: Handle exclusive none selection option
    custom_no_facture: function(frm) {
        lincaUtils.handleExclusiveNoneSelection(frm, 'custom_no_facture','custom_no_facture', [
            'votre_patient__a_été',
            'votre_patient',
            'votre_patient_2'
        ]);
    },
    votre_patient__a_été: function(frm) {
        console.log("votre_patient__a_été")
        lincaUtils.handleExclusiveNoneSelection(frm, 'votre_patient__a_été','custom_no_facture', [
            'votre_patient__a_été',
            'votre_patient',
            'votre_patient_2'
        ]);
    },
    votre_patient: function(frm) {
        console.log("votre_patient")
        lincaUtils.handleExclusiveNoneSelection(frm, 'votre_patient','custom_no_facture', [
            'votre_patient__a_été',
            'votre_patient',
            'votre_patient_2'
        ]);
    },
    votre_patient_2: function(frm) {
        console.log("votre_patient_2")
        lincaUtils.handleExclusiveNoneSelection(frm, 'votre_patient_2','custom_no_facture', [
            'votre_patient__a_été',
            'votre_patient',
            'votre_patient_2'
        ]);
    },

    //-------Check / Uncheck checkbox  YES/NO option-------------//
    oui: function(frm) {
        enforceSingleCheckboxSelection(frm, 'oui', 'non');
    },
    non: function(frm) {
        enforceSingleCheckboxSelection(frm, 'non', 'oui');
    },

    custom_mineur_: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_mineur_', 'custom_mjoeur');
    },
    custom_mjoeur: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_mjoeur', 'custom_mineur_');
    },

    custom_documented_allergy: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_documented_allergy', 'custom_undocumented_allergy');
    },
    custom_undocumented_allergy: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_undocumented_allergy', 'custom_documented_allergy');
    },

    custom_ouioui: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_ouioui', 'custom_custom_non');
    },
    custom_custom_non: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_custom_non', 'custom_ouioui');
    },

    custom_oui_fiévre: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_oui_fiévre', 'custom_non_fiévre_');
    },
    custom_non_fiévre_: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_non_fiévre_', 'custom_oui_fiévre');
    },

    custom_oui_hypotension_artierelle: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_oui_hypotension_artierelle', 'custom__non_hypotension_artierelle');
    },
    custom__non_hypotension_artierelle: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom__non_hypotension_artierelle', 'custom_oui_hypotension_artierelle');
    },

    custom_oui_matriel_etranger_: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_oui_matriel_etranger_', 'custom_non_matriel_etranger_');
    },
    custom_non_matriel_etranger_: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_non_matriel_etranger_', 'custom_oui_matriel_etranger_');
    },

    custom_bladder_catheter_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_bladder_catheter_inflammatory_signs_presence_yes', 'custom_bladder_catheter_inflammatory_signs_presence_no');
    },
    custom_bladder_catheter_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_bladder_catheter_inflammatory_signs_presence_no', 'custom_bladder_catheter_inflammatory_signs_presence_yes');
    },

    custom_vesicostomy_tube_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_vesicostomy_tube_inflammatory_signs_presence_yes', 'custom_vesicostomy_tube_inflammatory_signs_presence_no');
    },
    custom_vesicostomy_tube_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_vesicostomy_tube_inflammatory_signs_presence_no', 'custom_vesicostomy_tube_inflammatory_signs_presence_yes');
    },

    custom_nephrostomy_tube_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_nephrostomy_tube_inflammatory_signs_presence_yes', 'custom_nephrostomy_tube_inflammatory_signs_presence_no');
    },
    custom_nephrostomy_tube_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_nephrostomy_tube_inflammatory_signs_presence_no', 'custom_nephrostomy_tube_inflammatory_signs_presence_yes');
    },

    custom_peripheral_kt_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_peripheral_kt_inflammatory_signs_presence_yes', 'custom_peripheral_kt_inflammatory_signs_presence_no');
    },
    custom_peripheral_kt_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_peripheral_kt_inflammatory_signs_presence_no', 'custom_peripheral_kt_inflammatory_signs_presence_yes');
    },

    custom_kt_jigular_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_kt_jigular_inflammatory_signs_presence_yes', 'custom_kt_jigular_inflammatory_signs_presence_no');
    },
    custom_kt_jigular_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_kt_jigular_inflammatory_signs_presence_no', 'custom_kt_jigular_inflammatory_signs_presence_yes');
    },

    custom_femoral_kt_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_femoral_kt_inflammatory_signs_presence_yes', 'custom_femoral_kt_inflammatory_signs_presence_no');
    },
    custom_femoral_kt_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_femoral_kt_inflammatory_signs_presence_no', 'custom_femoral_kt_inflammatory_signs_presence_yes');
    },

    custom_prosthesis_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_prosthesis_inflammatory_signs_presence_yes', 'custom_prosthesis_inflammatory_signs_presence_no');
    },
    custom_prosthesis_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_prosthesis_inflammatory_signs_presence_no', 'custom_prosthesis_inflammatory_signs_presence_yes');
    },

    custom_osteosynthesis_equipment_inflammatory_sign_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_osteosynthesis_equipment_inflammatory_sign_presence_yes', 'custom_osteosynthesis_equipment_inflammatory_sign_presence_no');
    },
    custom_osteosynthesis_equipment_inflammatory_sign_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_osteosynthesis_equipment_inflammatory_sign_presence_no', 'custom_osteosynthesis_equipment_inflammatory_sign_presence_yes');
    },

    custom_tracheostomy_tube_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_tracheostomy_tube_inflammatory_signs_presence_yes', 'custom_tracheostomy_tube_inflammatory_signs_presence_no');
    },
    custom_tracheostomy_tube_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_tracheostomy_tube_inflammatory_signs_presence_no', 'custom_tracheostomy_tube_inflammatory_signs_presence_yes');
    },

    custom_tracheal_intubation_tube_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_tracheal_intubation_tube_inflammatory_signs_presence_yes', 'custom_tracheal_intubation_tube_inflammatory_signs_presence_no');
    },
    custom_tracheal_intubation_tube_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_tracheal_intubation_tube_inflammatory_signs_presence_no', 'custom_tracheal_intubation_tube_inflammatory_signs_presence_yes');
    },

    custom_implantable_chamber_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_implantable_chamber_inflammatory_signs_presence_yes', 'custom_implantable_chamber_inflammatory_signs_presence_no');
    },
    custom_implantable_chamber_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_implantable_chamber_inflammatory_signs_presence_no', 'custom_implantable_chamber_inflammatory_signs_presence_yes');
    },

    custom_pacemaker_inflammatory_signs_presence_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_pacemaker_inflammatory_signs_presence_yes', 'custom_pacemaker_inflammatory_signs_presence_no');
    },
    custom_pacemaker_inflammatory_signs_presence_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_pacemaker_inflammatory_signs_presence_no', 'custom_pacemaker_inflammatory_signs_presence_yes');
    },

    custom_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_yes', 'custom_no');
        autoAddChildRow(frm, 'custom_yes', 'custom_notice_anti_infective_item');
    },
    custom_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_no', 'custom_yes');
    },

    custom_blood_count_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_blood_count_yes', 'custom_blood_count_no');
        autoAddChildRow(frm, 'custom_blood_count_yes', 'custom_blood_analysis');
    },
    custom_blood_count_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_blood_count_no', 'custom_blood_count_yes');
    },

    custom_renal_function_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_renal_function_yes', 'custom_renal_function_no');
        autoAddChildRow(frm, 'custom_renal_function_yes', 'custom_renal_function_analysis');
    },
    custom_renal_function_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_renal_function_no', 'custom_renal_function_yes');
    },

    custom_liver_function_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_liver_function_yes', 'custom_liver_function_no');
        autoAddChildRow(frm, 'custom_liver_function_yes', 'custom_liver_function_analysis');
    },
    custom_liver_function_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_liver_function_no', 'custom_liver_function_yes');
    },

    custom_inflammatory_assessment_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_inflammatory_assessment_yes', 'custom_inflammatory_assessment_no');
        autoAddChildRow(frm, 'custom_inflammatory_assessment_yes', 'custom_inflammatory_assessment_analysis');
    },
    custom_inflammatory_assessment_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_inflammatory_assessment_no', 'custom_inflammatory_assessment_yes');
    },

    custom_other_biology_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_other_biology_yes', 'custom_other_biology_no');
        autoAddChildRow(frm, 'custom_other_biology_yes', 'custom_other_biology_list');
    },
    custom_other_biology_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_other_biology_no', 'custom_other_biology_yes');
    },

    custom_microbiological_examination_done_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_microbiological_examination_done_yes', 'custom_microbiological_examination_done_no');
    },
    custom_microbiological_examination_done_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_microbiological_examination_done_no', 'custom_microbiological_examination_done_yes');
    },

    custom_radiological_examination_done_yes: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_radiological_examination_done_yes', 'custom_radiological_examination_done_no');
    },
    custom_radiological_examination_done_no: function(frm) {
        enforceSingleCheckboxSelection(frm, 'custom_radiological_examination_done_no', 'custom_radiological_examination_done_yes');
    },

    //-------Display Blood Cultures table rows-------//
    custom_number_of_blood_cultures: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_blood_cultures',
            desired_row_count: frm.doc.custom_number_of_blood_cultures || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display ECBU table rows-------//
    custom_number_of_ecbu: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_ecbus',
            desired_row_count: frm.doc.custom_number_of_ecbu || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display Lumbar Punctures table rows-------//
    custom_number_of_pl: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_lumbar_punctures',
            desired_row_count: frm.doc.custom_number_of_pl || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display Stool Cultures table rows-------//
    custom_number_of_stool_cultures: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_stool_cultures',
            desired_row_count: frm.doc.custom_number_of_stool_cultures || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display ECBCs table rows-------//
    custom_number_of_ecbc: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_ecbcs',
            desired_row_count: frm.doc.custom_number_of_ecbc || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display BALs table rows-------//
    custom_number_of_bal: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_bal_bronchoalveolar_fluid',
            desired_row_count: frm.doc.custom_number_of_bal || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display PTPs table rows-------//
    custom_number_of_ptps: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_ptp_protected_tracheal_sampling',
            desired_row_count: frm.doc.custom_number_of_ptps || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display RBK table rows-------//
    custom_number_of_rbks: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_rbks',
            desired_row_count: frm.doc.custom_number_of_rbks || 0,
            image_rendering: true,
            image_options: {}
        });
    },

    //-------Display EPS table rows-------//
    custom_number_of_eps: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_eps',
            desired_row_count: frm.doc.custom_number_of_eps || 0,
            image_rendering: true,
            image_options: {}
        });
    },

    //-------Display Superficial Pus table rows-------//
    custom_number_of_superficial_pus: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_superficial_puses',
            desired_row_count: frm.doc.custom_number_of_superficial_pus || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display Deep Pus table rows-------//
    custom_number_of_deep_pus: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_deep_puses',
            desired_row_count: frm.doc.custom_number_of_deep_pus || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display Prosthetics table rows-------//
    custom_number_of_prosthesis: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_prosthesis_list',
            desired_row_count: frm.doc.custom_number_of_prosthesis || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },
    
    //-------Display Devices table rows-------//
    custom_number_of_devices: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_devices_kt_probe_',
            desired_row_count: frm.doc.custom_number_of_devices || 0,
            image_rendering: true,
            image_options: {
                image_fieldname: 'antibiogram',
                preview_fieldname: 'antibiogram_preview'
            }
        });
    },

    //-------Display Serology table rows-------//
    custom_number_of_serologies: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_serologies',
            desired_row_count: frm.doc.custom_number_of_serologies || 0,
            image_rendering: true,
            image_options: {}
        });
    },

    //-------Display PCR table rows-------//
    custom_number_of_pcr: function(frm) {
        adjust_child_table_rows(frm, {
            child_table_fieldname: 'custom_pcrs',
            desired_row_count: frm.doc.custom_number_of_pcr || 0,
            image_rendering: true,
            image_options: {}
        });
    }
});

function renderSectionTitle(frm, fieldname, title) {
    if (frm.fields_dict[fieldname]) {
        const styleId = "section-title-style";

        // Ajouter le style une seule fois
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.innerHTML = `
                .clinical-exam-title {
                    background-color: #4eb6f5;
                    color: white;
                    text-align: center;
                    padding: 20px 20px;
                    border-radius: 15px;
                    margin: 10px 0;
                    font-weight: bold;
                    width: 100%;
                    box-sizing: border-box;
                }
            `;
            document.head.appendChild(style);
        }

        const titleHtml = `<div class="clinical-exam-title">${__(title)}</div>`;
        frm.fields_dict[fieldname].$wrapper.prepend(titleHtml);
    }
}

function renderImagePreviewForTable(frm, tableFieldname, urlFieldname, htmlFieldname) {
    const grid = frm.fields_dict[tableFieldname].grid;

    const renderRow = (row, rowIndex) => {
        const htmlCell = row.columns[htmlFieldname];
        const htmlElement = $(htmlCell).get(0);
        const urlsRaw = row.doc[urlFieldname] || "";
        const urls = urlsRaw.split(',').map(url => url.trim()).filter(Boolean);

        if (!htmlCell || !htmlElement) return;

        $(htmlCell).html('');
        htmlElement.style.overflowX = 'auto';
        htmlElement.style.overflowY = 'hidden';
        htmlElement.style.maxWidth = '100%';
        htmlElement.style.display = 'block';

        const container = document.createElement('div');
        container.className = 'image-preview-wrapper';
        container.style.display = 'flex';
        container.style.flexWrap = 'nowrap';
        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        container.style.maxWidth = '100%';
        container.style.width = '100%';
        container.style.boxSizing = 'border-box';
        container.style.gap = '8px';
        container.style.alignItems = 'center';
        container.style.padding = '4px';
        container.style.border = '1px solid #eee';
        container.style.borderRadius = '6px';
        container.style.backgroundColor = '#fff';

        urls.forEach((url, i) => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '60px';
            wrapper.style.height = '60px';
            wrapper.style.flex = '0 0 auto';

            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.cursor = 'pointer';

            img.onclick = () => {
                frappe.msgprint({
                    title: `${__(`Image`)} ${i + 1}`,
                    message: `<img src="${url}" style="max-width:100%; max-height:80vh;" />`,
                    indicator: 'blue',
                    wide: true
                });
            };

            const removeBtn = document.createElement('span');
            removeBtn.innerText = '❌';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '0px';
            removeBtn.style.right = '0px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.padding = '2px 5px';
            removeBtn.style.fontSize = '8px';
            removeBtn.style.color = 'red';

            removeBtn.onclick = () => {
                urls.splice(i, 1);
                frappe.model.set_value(row.doc.doctype, row.doc.name, urlFieldname, urls.join(', '));
                frappe.model.set_value(row.doc.doctype, row.doc.name, htmlFieldname, '');
                setTimeout(() => renderRow(row, rowIndex), 100);
            };

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        });

        const addBtnWrapper = document.createElement('div');
        addBtnWrapper.style.width = '60px';
        addBtnWrapper.style.height = '60px';
        addBtnWrapper.style.display = 'flex';
        addBtnWrapper.style.alignItems = 'center';
        addBtnWrapper.style.justifyContent = 'center';
        addBtnWrapper.style.border = '1px dashed #ccc';
        addBtnWrapper.style.borderRadius = '4px';
        addBtnWrapper.style.flex = '0 0 auto';
        addBtnWrapper.style.cursor = 'pointer';
        //addBtnWrapper.title = 'Ajouter une image';

        const plusIcon = document.createElement('span');
        plusIcon.innerText = '+';
        plusIcon.style.fontSize = '28px';
        plusIcon.style.color = '#007bff';

        addBtnWrapper.onclick = () => {
            const uploader = new frappe.ui.FileUploader({
                allow_multiple: false,
                on_success(file) {
                    urls.push(file.file_url);
                    frappe.model.set_value(row.doc.doctype, row.doc.name, urlFieldname, urls.join(', '));
                    // frappe.model.set_value(row.doc.doctype, row.doc.name, htmlFieldname, '');
                    setTimeout(() => renderRow(row, rowIndex), 100);
                }
            });
            uploader.show();
        };

        addBtnWrapper.appendChild(plusIcon);
        container.appendChild(addBtnWrapper);

        $(htmlCell).html(container);
        // frappe.model.set_value(row.doc.doctype, row.doc.name, htmlFieldname, container.outerHTML);
    };

    grid.grid_rows.forEach((row, index) => {
        renderRow(row, index);
    });

    frm.refresh_field(tableFieldname);
}

function renderImagePreviewForField(frm, fieldname) {
    const wrapper = frm.fields_dict[fieldname].$wrapper;
    const urlsRaw = frm.doc[fieldname] || "";
    const urls = urlsRaw.split(',').map(url => url.trim()).filter(Boolean);

    wrapper.empty();

    const container = document.createElement('div');
    container.className = 'image-preview-wrapper';
    container.style.display = 'flex';
    container.style.flexWrap = 'nowrap';
    container.style.overflowX = 'auto';
    container.style.gap = '8px';
    container.style.alignItems = 'center';
    container.style.padding = '4px';
    //container.style.border = '1px solid #eee';
    container.style.borderRadius = '6px';
    container.style.backgroundColor = '#fff';
    container.style.minHeight = '70px';

    urls.forEach((url, i) => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.position = 'relative';
        wrapperDiv.style.width = '60px';
        wrapperDiv.style.height = '60px';
        wrapperDiv.style.flex = '0 0 auto';

        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        img.style.cursor = 'pointer';

        img.onclick = () => {
            frappe.msgprint({
                title: `${__(`Image`)} ${i + 1}`,
                message: `<img src="${url}" style="max-width:100%; max-height:80vh;" />`,
                indicator: 'blue',
                wide: true
            });
        };

        const removeBtn = document.createElement('span');
        removeBtn.innerText = '❌';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '0px';
        removeBtn.style.right = '0px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.padding = '2px 5px';
        removeBtn.style.fontSize = '8px';
        removeBtn.style.color = 'red';

        removeBtn.onclick = () => {
            urls.splice(i, 1);
            frm.set_value(fieldname, urls.join(', '));
            setTimeout(() => renderImagePreviewForField(frm, fieldname), 100);
        };

        wrapperDiv.appendChild(img);
        wrapperDiv.appendChild(removeBtn);
        container.appendChild(wrapperDiv);
    });

    // Add image upload button
    const addBtnWrapper = document.createElement('div');
    addBtnWrapper.style.width = '60px';
    addBtnWrapper.style.height = '60px';
    addBtnWrapper.style.display = 'flex';
    addBtnWrapper.style.alignItems = 'center';
    addBtnWrapper.style.justifyContent = 'center';
    addBtnWrapper.style.border = '1px dashed #ccc';
    addBtnWrapper.style.borderRadius = '4px';
    addBtnWrapper.style.flex = '0 0 auto';
    addBtnWrapper.style.cursor = 'pointer';

    const plusIcon = document.createElement('span');
    plusIcon.innerText = '+';
    plusIcon.style.fontSize = '28px';
    plusIcon.style.color = '#007bff';

    addBtnWrapper.onclick = () => {
        const uploader = new frappe.ui.FileUploader({
            allow_multiple: false,
            on_success(file) {
                urls.push(file.file_url);
                frm.set_value(fieldname, urls.join(', '));
                setTimeout(() => renderImagePreviewForField(frm, fieldname), 100);
            }
        });
        uploader.show();
    };

    addBtnWrapper.appendChild(plusIcon);
    container.appendChild(addBtnWrapper);

    wrapper.append(container);
}

function adjust_child_table_rows(frm, {
    child_table_fieldname,
    desired_row_count,
    image_rendering = false,
    image_options = {} // { image_fieldname: '', preview_fieldname: '' }
}) {
    let current_rows = frm.doc[child_table_fieldname] || [];
    let grid = frm.fields_dict[child_table_fieldname].grid;

    // Supprimer les lignes excédentaires
    if (current_rows.length > desired_row_count) {
        let rows_to_remove = current_rows.length - desired_row_count;
        for (let i = 0; i < rows_to_remove; i++) {
            grid.grid_rows[current_rows.length - 1 - i].remove();
        }
    }
    // Ajouter des lignes supplémentaires
    else if (current_rows.length < desired_row_count) {
        for (let i = current_rows.length; i < desired_row_count; i++) {
            grid.add_new_row();
        }
    }

    // Si rendu d'image demandé
    if (image_rendering && image_options.image_fieldname && image_options.preview_fieldname) {
        renderImagePreviewForTable(
            frm,
            child_table_fieldname,
            image_options.image_fieldname,
            image_options.preview_fieldname
        );
    }
}

function autoAddChildRow(frm, triggerField, targetTable) {
    if (frm.doc[triggerField] == 1) {
        console.log("Ajout de ligne en cours ...");
        const existingRows = frm.doc[targetTable] || [];

        if (existingRows.length === 0) {
            console.log("Empty Table-----------");
            const newRow = frm.add_child(targetTable);

            // Optional: pre-fill default values
            // newRow.example_field = 'Default';

            frm.refresh_field(targetTable);
        }
    }
}

function hideGridButtons(frm, child_table_fieldname) {
    const grid = frm.fields_dict[child_table_fieldname]?.grid;
    if (!grid) {
        console.warn(`Field '${child_table_fieldname}' not found or not a child table.`);
        return;
    }

    const $wrapper = grid.wrapper;
    const $buttons = $wrapper.find('.grid-buttons');

    if ($buttons.length > 0) {
        $buttons.addClass("hidden");
        console.log(`Grid Buttons hidden for '${child_table_fieldname}'`);
    } else {
        console.log(`Grid Buttons not found for '${child_table_fieldname}'`);
    }
}

function enforceSingleCheckboxSelection(frm, currentField, otherField) {
    if (frm.doc[currentField]) {
        frm.set_value(otherField, 0);
    }
}


//Set editable field in Notice Serology Item Doctype according to 'serology_name' field
// frappe.ui.form.on('Notice Serology Item', {
//     serology_name: function(frm, cdt, cdn) {
//         // Récupère la ligne du grid correspondante
//         let row = locals[cdt][cdn];

//         // Mettez à jour les champs en fonction de la valeur de serology_name
//         setEditableFields(frm, row);
//     }
// });

//Set Result select options List when choosing serology name
// Fonction d'injection CSS (à placer en haut du fichier)
function injectMultiSelectCSS() {
    if (document.getElementById('custom-multi-select-css')) return;
    
    const css = `
    .custom-multi-select-container {
        position: relative;
        min-height: 34px;
        padding: 3px 6px;
        border: 1px solid #d1d8dd;
        border-radius: 3px;
        background-color: #fff;
        transition: all 0.2s;
    }
    
    .custom-multi-select-container.has-pills {
        padding: 5px;
    }
    
    .hidden-select {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        cursor: pointer;
        z-index: 1;
    }
    
    .pills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        min-height: 24px;
    }
    
    .selection-pill {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background-color: #e0e6ff;
        border-radius: 10px;
        font-size: 12px;
        line-height: 1.5;
    }
    
    .remove-pill {
        margin-left: 5px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        color: #848484;
    }
    
    .remove-pill:hover {
        color: #ff5858;
    }
    
    .custom-multi-select-container:focus-within {
        border-color: #8d99a6;
        box-shadow: 0 0 0 2px rgba(196, 206, 213, 0.5);
    }
    `;

    const style = document.createElement('style');
    style.id = 'custom-multi-select-css';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

frappe.ui.form.on('Notice Serology Item', {
    setup: function(frm) {
        // Déclaration des options une seule fois
        frm.serology_options = {
            "VIH": ["In Progress", "Positive", "Negative"],
            "Hepatitis B": ["In Progress", "Anti-HBs", "Anti-HBc", "Ag-HBs", "Ag-HBe", "Anti-HBe"],
            "Hepatitis C": ["In Progress", "lgM", "lgG"],
            "CMV": ["In Progress", "lgM", "lgG"],
            "Toxoplasmosis": ["In Progress", "lgM", "lgG"],
            "EBV": ["In Progress", "Anti-EBNA lgM", "Anti-EBNA lgG", "Anti-VCA lgM", "Anti-VCA lgG"],
            "Syphilis": ["In Progress", "TPHA", "VDRL"]
        };
        
        // Injection du CSS
        injectMultiSelectCSS();
    },

    refresh: function(frm) {
        // Initialisation pour toutes les lignes existantes
        (frm.doc.custom_serologies || []).forEach(row => {
            if (row.serology_name) initMultiSelect(frm, row);
        });
    },

    serology_name: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        initMultiSelect(frm, row);
    },

    custom_serologies_add: function(frm, cdt, cdn) {
        setTimeout(() => initMultiSelect(frm, locals[cdt][cdn]), 100);
    }
});

//ItesLab: Define immunosuppression factors fields
const immunoFields = [
  'custom_corticothérapie15_jours',
  'custom_biographie_',
  'custom_immunosuppresseurs',
  'custom_chimiothérapie',
  'custom_issufisance_rénale_au_stade_dhémodialyse',
  'custom_insuffisance_hépatique_crrihose',
  'custom_splénectomie',
  'custom_infection_à_vih_',
  'custom_none'
];

//ItesLab: Handle exclusive none selection option
immunoFields.forEach(fieldname => {
    frappe.ui.form.on('Patient et demande', {
        [fieldname]: function(frm) {
            lincaUtils.handleExclusiveNoneSelection(frm, fieldname, 'custom_none', immunoFields.filter(field => field !== 'custom_none'));
        }
    });
});

// ItesLab: Declare the constant outside the function (module level)
const SEROLOGY_OPTIONS = {
    "VIH": ["In Progress", "Positive", "Negative"],
    "Hepatitis B": ["In Progress", "Anti-HBs", "Anti-HBc", "Ag-HBs", "Ag-HBe", "Anti-HBe"],
    "Hepatitis C": ["In Progress", "lgM", "lgG"],
    "CMV": ["In Progress", "lgM", "lgG"],
    "Toxoplasmosis": ["In Progress", "lgM", "lgG"],
    "EBV": ["In Progress", "Anti-EBNA lgM", "Anti-EBNA lgG", "Anti-VCA lgM", "Anti-VCA lgG"],
    "Syphilis": ["In Progress", "TPHA", "VDRL"]
};

function initMultiSelect(frm, row) {
    if (!row.serology_name) return;

    const grid = frm.fields_dict.custom_serologies.grid;
    const grid_row = grid.grid_rows_by_docname[row.name];
    
    if (!grid_row) return;

    // Méthode correcte pour Frappe/ERPNext
    const $cell = $(grid_row.row).find('[data-fieldname="result"]');
    if (!$cell.length) {
        console.error("Cellule 'result' introuvable dans la ligne");
        return;
    }

    const current_values = row.result ? row.result.split(/\s*,\s*/) : [];
    const options = SEROLOGY_OPTIONS[row.serology_name] || []; // Utilisation directe de la constante

    // Construction du HTML
    $cell.html(`
    <div class="custom-multi-select-container">
        <select multiple class="hidden-select">
            ${options.map(opt => `
                <option value="${frappe.utils.escape_html(opt)}" 
                    ${current_values.includes(opt) ? 'selected' : ''}>
                    ${__(opt)}
                </option>
            `).join('')}
        </select>
        <div class="pills-container"></div>
    </div>
    `);

    // Initialisation des pills
    updatePills($cell.find('select'));

    // Gestion des événements
    $cell.off('change.select click.pill').on({
        'change.select': 'select', function() {
            const values = Array.from(this.selectedOptions, o => o.value);
            frappe.model.set_value(row.doctype, row.name, 'result', values.join(', '));
            updatePills($(this));
        },
        'click.pill': '.remove-pill', function(e) {
            e.stopPropagation();
            const value = $(this).data('value');
            $(this).closest('.custom-multi-select-container')
                .find(`option[value="${frappe.utils.escape_html(value)}"]`)
                .prop('selected', false)
                .trigger('change');
        }
    });
}

function updatePills($select) {
    const $container = $select.siblings('.pills-container');
    $container.empty();

    $select.find('option:selected').each(function() {
        $container.append(`
        <span class="selection-pill label label-default">
            ${__(this.textContent)}
            <span class="remove-pill" data-value="${frappe.utils.escape_html(this.value)}">
                &times;
            </span>
        </span>
        `);
    });

    $select.closest('.custom-multi-select-container')
        .toggleClass('has-pills', $container.children().length > 0)
        .css('min-height', $container.children().length ? 'auto' : '34px');
}

function setEditableFields(frm, row) {
    const fieldMap = {
        'VIH': 'vih_result',
        'Hepatitis B': 'hepatitis_b_result',
        'Hepatitis C': 'hepatitis_c_result',
        'EBV': 'ebv_result',
        'CMV': 'cmv_result',
        'Syphilis': 'syphilis_result',
        'Toxoplasmosis': 'toxoplasmosis_result'
    };

    // Déterminer quel champ sera éditable basé sur la valeur de serology_name
    const editableField = fieldMap[row.serology_name] || null;
    console.log("Editable field --->", editableField);

    const grid = frm.fields_dict['custom_serologies'].grid;

    if (grid) {
        // Parcourir toutes les lignes du grid
        grid.grid_rows.forEach(gridRow => {
            // Appliquer le traitement uniquement à la ligne correspondante
            if (gridRow.doc.name === row.name) {
                console.log("Ligne trouvée :", gridRow.doc.name);

                // Pour chaque champ dans fieldMap, rendre celui-ci éditable ou readonly
                Object.values(fieldMap).forEach(field => {
                    const fieldControl = gridRow.on_grid_fields_dict[field];
                    if (fieldControl) {
                        // Si le champ correspond à celui qui doit être éditable, le rendre editable
                        const isEditable = (field === editableField);
                        fieldControl.df.read_only = !isEditable;
                        //fieldControl.refresh(); // Appliquer les modifications
                        console.log(`Champ ${field} est maintenant ${isEditable ? 'éditable' : 'readonly'}`);
                    } else {
                        console.log(`Champ ${field} introuvable dans on_grid_fields_dict`);
                    }
                });

                // Rafraîchir le grid pour appliquer les changements de manière visible
                grid.refresh();
            }
        });
    }
}

function check_word_limit(frm, fieldname, maxWords) {
    const value = frm.doc[fieldname];
    if (value) {
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount > maxWords) {
            const label = frappe.meta.get_docfield(frm.doctype, fieldname, frm.doc.name).label;
            frappe.throw(
                __("{0} has {1} words. Maximum allowed: {2} words.", [__(label), wordCount, maxWords])
            );
        }
    }
}


// Custom CRMNotes Implementation
// class CustomCRMNotes {
//     constructor(opts) {
//         $.extend(this, opts);
//     }

//     refresh() {
//         this.notes_wrapper.find(".notes-section").remove();

//         let notes = this.frm.doc.notes || [];
//         notes.sort((a, b) => new Date(b.added_on) - new Date(a.added_on));

//         let notes_html = frappe.render_template("crm_notes", { notes: notes });
//         $(notes_html).appendTo(this.notes_wrapper);

//         this.add_note();

//         this.notes_wrapper.find(".edit-note-btn").on("click", (e) => this.edit_note(e.currentTarget));
//         this.notes_wrapper.find(".delete-note-btn").on("click", (e) => this.delete_note(e.currentTarget));
//     }

//     add_note() {
//         let dialog = new frappe.ui.Dialog({
//             title: __("Add a Note"),
//             fields: [{ label: "Note", fieldname: "note", fieldtype: "Text Editor", reqd: 1 }],
//             primary_action: (data) => {
//                 frappe.call({
//                     method: "add_note",
//                     doc: this.frm.doc,
//                     args: { note: data.note },
//                     callback: () => {
//                         this.frm.refresh_field("notes");
//                         this.refresh();
//                         dialog.hide();
//                     },
//                 });
//             },
//             primary_action_label: __("Add"),
//         });
//         dialog.show();
//     }

//     edit_note(edit_btn) {
//         let row = $(edit_btn).closest(".comment-content");
//         let row_id = row.attr("name");
//         let row_content = $(row).find(".content").html();

//         let dialog = new frappe.ui.Dialog({
//             title: __("Edit Note"),
//             fields: [{ label: "Note", fieldname: "note", fieldtype: "Text Editor", default: row_content }],
//             primary_action: (data) => {
//                 frappe.call({
//                     method: "edit_note",
//                     doc: this.frm.doc,
//                     args: { note: data.note, row_id: row_id },
//                     callback: () => {
//                         this.frm.refresh_field("notes");
//                         this.refresh();
//                         dialog.hide();
//                     },
//                 });
//             },
//             primary_action_label: __("Save"),
//         });
//         dialog.show();
//     }

//     delete_note(delete_btn) {
//         let row_id = $(delete_btn).closest(".comment-content").attr("name");
//         frappe.call({
//             method: "delete_note",
//             doc: this.frm.doc,
//             args: { row_id: row_id },
//             callback: () => {
//                 this.frm.refresh_field("notes");
//                 this.refresh();
//             },
//         });
//     }
// }
