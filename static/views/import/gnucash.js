var App_View_Import_Gnucash = AbstractView.extend({
    subviews: {
        'gnucash_import_file_upload': new Kernel_View_Ui_FileUpload({
            name: 'file',
            filetypes: ['application/x-gnucash'],
            exts: ['gnucash'],
            multiple: true,
            maxsize: 5*1024*1024
        }),
    },

    events: {
        'submit #gnucash-form': 'submit'
    },

    submit: function (event) {
        // Do not upload the form the standard way
        event.preventDefault();

        // Instead do it with ajax
        $form = this.$('#gnucash-form');
        var formData = new FormData($form[0]);

        Backbone.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            // manually create xhr request
            /*xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress',
                        progressHandlingFunction, false);
                }
                return xhr;
                },*/
            //Ajax events
            success: this.success.bind(this),
            error: this.error.bind(this),
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false
        });
    },

    success: function (response) {
        message = new StatusMessage({
            message: 'File was sucessfully imported (click to go to assets)',
            type: 'success',
            click: function () {
                console.log(Electrum.allAccountTypes);
                _.each(Electrum.allAccountTypes, function (collection) {
                    collection.resetFetched(); // otherwise the user needs to reload the page
                });
                Electrum.router.navigate('/assets', {trigger: true});
            }
        });
        message.show();
    },

    error: function (response) {
        var msg = 'The uploaded file could not be imported. Are you sure it\'s a valid gnucash file?'
        if (response == 'bad request') {
            msg = 'You need to choose a file to import!';
        }

        message = new StatusMessage({
            message: msg,
            type: 'error'
        });
        message.show();
    }
});
