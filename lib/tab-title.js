var CompositeDisposable = require('atom').CompositeDisposable;

var TabTitle = {
    subscriptions: null,

    config: {
        defaultTitle: {
            type: 'string',
            default: 'Untitled',
            description: 'The title given to unsaved tabs when there is no content in the editor.'
        },

        maxTitleLength: {
            type: 'number',
            default: 50,
            description: 'The maximum number of characters that will be shown in the window title.'
        }
    },

    activate: function(state) {
        this.setTitle = this.setTitle.bind(this);
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
            this.subscriptions.add(editor.onDidChangePath(this.setTitle));
            this.subscriptions.add(editor.onDidChange(this.setTitle));
            this.subscriptions.add(editor.onDidChangeTitle(this.setTitle));
        }));

        this.subscriptions.add(atom.workspace.observeActivePane((pane) => {
            this.subscriptions.add(pane.onDidActivate(this.setTitle));
        }));

        this.subscriptions.add(atom.workspace.onDidDestroyPaneItem(this.setTitle));
        this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(this.setTitle));
    },

    deactivate: function() {
        this.subscriptions.dispose();
    },

    isTemporary: function(pane){
        return !!(pane.buffer && !pane.buffer.file);
    },

    setWindowTitle: function(title){
        var maxLength = atom.config.get('tab-title.maxTitleLength');

        if(title.length > maxLength){
            title = title.substr(0, maxLength) + '...';
        }

        document.title = title;
    },

    setTabTitle: function(index, title){
        var tab = atom.views.getView(atom.workspace).querySelectorAll('li.tab .title')[index];

        if(tab)
            tab.innerText = title;
    },

    generateTitle: function(item){
        return item.buffer.lines[0] ||
               atom.config.get('tab-title.defaultTitle');
    },

    setTitle: function() {
        var items = atom.workspace.getPaneItems();

        items.forEach((item, index) => {
            // ignore saved tabs
            if(!this.isTemporary(item)){ return; }

            var title = this.generateTitle(item);

            this.setTabTitle(index, title);

            // set the window title if this is the current tab
            var activePaneItem = atom.workspace.getActivePaneItem();
            if(activePaneItem && item.id === activePaneItem.id){
                this.setWindowTitle(title);
            }
        });
    }
};

module.exports = {
    config: TabTitle.config,
    activate: TabTitle.activate.bind(TabTitle),
    deactivate: TabTitle.deactivate.bind(TabTitle)
};
