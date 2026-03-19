// ========== 新版 LuCI JS 视图（替换原 CBI 页面） ==========
'use strict';
'require view';
'require ui';
'require rpc';
'require form';
'require fs';
'require i18n';

// ⭐ 加载语言
i18n.load('filetransfer');

return view.extend({
    render: function () {
        let container = E('div', { class: 'cbi-map' }, [
            E('h2', _('File Transfer')),

            // 上传区域
            E('div', {
                style: 'border:2px dashed #ccc;padding:20px;text-align:center;cursor:pointer;',
                click: this.handleUpload.bind(this)
            }, [_('Click or drag file here to upload')]),

            E('br'),

            // 文件列表
            E('div', { id: 'file-list' }, _('Loading...'))
        ]);

        this.loadFiles();
        return container;
    },

    handleUpload: function () {
        let input = document.createElement('input');
        input.type = 'file';

        input.onchange = (e) => {
            let file = e.target.files[0];
            if (!file) return;

            let formData = new FormData();
            formData.append('file', file);

            ui.showModal(_('Uploading...'));

            fetch('/cgi-bin/luci/admin/system/filetransfer/upload', {
                method: 'POST',
                body: formData
            }).then(() => {
                ui.hideModal();
                this.loadFiles();
            });
        };

        input.click();
    },

    loadFiles: function () {
        fetch('/cgi-bin/luci/admin/system/filetransfer/list')
            .then(res => res.json())
            .then(data => {
                let list = document.getElementById('file-list');
                list.innerHTML = '';

                data.files.forEach(f => {
                    list.appendChild(E('div', {}, [
                        f,
                        ' ',
                        E('button', {
                            click: () => this.deleteFile(f)
                        }, _('Delete'))
                    ]));
                });
            });
    },

    deleteFile: function (name) {
        fetch('/cgi-bin/luci/admin/system/filetransfer/delete?name=' + name)
            .then(() => this.loadFiles());
    }
});
