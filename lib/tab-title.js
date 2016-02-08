var CompositeDisposable = require('atom').CompositeDisposable;

var TabTitle = {
    subscriptions: null,

    config: {
        defaultPlaceholder: {
            type: 'string',
            default: 'Untitled'
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
        document.title = title;
    },

    setTabTitle: function(index, title){
        var tab = atom.views.getView(atom.workspace).querySelectorAll('li.tab .title')[index];

        if(tab)
            tab.innerText = title;
    },

    generateTitle: function(item){
        return item.buffer.lines[0] ||
               atom.config.get('tab-title.defaultPlaceholder');
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
