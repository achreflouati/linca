frappe.ui.form.on("Mise a jour avis", {
    refresh(frm) {
        let $wrapper = $(frm.fields_dict.multiple_images.wrapper);
        $wrapper.empty();

        // Conteneur pour l'ajout d'images
        let $container = $('<div class="image-container" style="display: flex; flex-wrap: wrap; gap: 10px;"></div>').appendTo($wrapper);

        // Ajout d'un label au-dessus du bouton
        let $label = $('<label class="btn-label" style="font-size: 16px; font-weight: bold; margin-bottom: 15px; display: block;">Ajouter des images :</label>').appendTo($wrapper);

        // Bouton plus amélioré et agrandi
        let $addButton = $('<button class="btn btn-primary btn-lg" title="Cliquez pour ajouter une image" style="padding: 10px 20px; font-size: 18px; display: flex; align-items: center; justify-content: center;"><i class="fa fa-plus" style="margin-right: 10px;"></i> Ajouter</button>').appendTo($wrapper);
        
        let images = frm.doc.images ? JSON.parse(frm.doc.images) : [];

        // Fonction pour afficher une image en grand avec zoom
        function showPreview(imageUrl) {
            $(".image-preview-overlay").remove();

            let $overlay = $('<div class="image-preview-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;"></div>');
            let $img = $('<img src="' + imageUrl + '" class="preview-image" style="max-width: 80vw; max-height: 80vh; cursor: grab;">');

            let scale = 1;

            // Fermer l'aperçu en cliquant en dehors
            $overlay.click(function (e) {
                if (e.target === this) {
                    $overlay.remove();
                }
            });

            // Zoom avec la molette de la souris
            $img.on("wheel", function (event) {
                event.preventDefault();
                let delta = event.originalEvent.deltaY > 0 ? -0.1 : 0.1;
                scale += delta;
                scale = Math.min(Math.max(1, scale), 3); // Limiter le zoom entre 1x et 3x
                $img.css("transform", "scale(" + scale + ")");
            });

            $overlay.append($img);
            $("body").append($overlay);
        }

        // Fonction pour ajouter une image à l'affichage
        function addImagePreview(file, fileUrl = null) {
            let $previewContainer = $('<div style="position: relative; display: inline-block;"></div>');
            let $img = $('<img width="100" height="100" class="clickable-image" style="margin:5px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">');

            if (fileUrl) {
                $img.attr("src", fileUrl);
            } else {
                let reader = new FileReader();
                reader.onload = function (e) {
                    $img.attr("src", e.target.result);
                };
                reader.readAsDataURL(file);
            }

            // Ajouter l'action de prévisualisation
            $img.off("click").on("click", function () {
                showPreview($img.attr("src"));
            });

            // Bouton de suppression
            let $deleteButton = $('<button class="btn btn-danger btn-sm" style="position: absolute; top: 0; right: 0;">X</button>');
            $deleteButton.click(function () {
                $previewContainer.remove();
                images = images.filter(img => img !== fileUrl);
                frm.set_value("images", JSON.stringify(images));
                frm.save();
            });

            $previewContainer.append($img).append($deleteButton);
            $container.append($previewContainer);
        }

        // Bouton pour ajouter une image
        $addButton.click(function () {
            if (!frm.doc.name) {
                frappe.msgprint(__("Veuillez enregistrer le document avant d'ajouter une image."));
                return;
            }

            let $input = $('<input type="file" accept="image/*" style="display: none;">');
            $input.appendTo($wrapper).click();

            $input.change(function () {
                let file = this.files[0];
                if (file) {
                    addImagePreview(file);

                    let reader = new FileReader();
                    reader.onload = function (e) {
                        let fileData = e.target.result.split(",")[1];

                        frappe.call({
                            method: "linca.utils.image.upload_image",
                            args: {
                                filename: file.name,
                                filedata: fileData,
                                docname: frm.doc.name
                            },
                            callback: function (response) {
                                if (response.message) {
                                    let file_url = response.message.file_url;
                                    images.push(file_url);
                                    frm.set_value("images", JSON.stringify(images));
                                    frm.save();
                                }
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Charger les images existantes
        if (frm.doc.images) {
            try {
                images.forEach(img_url => {
                    addImagePreview(null, img_url);
                });
            } catch (error) {
                console.error("Erreur de chargement des images:", error);
            }
        }
    }
});
