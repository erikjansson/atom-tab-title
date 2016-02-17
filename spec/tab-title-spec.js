var TabTitle = require('../lib/tab-title');

describe('TabTitle', () => {
    var workspaceElement, activationPromise;

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);
        activationPromise = atom.packages.activatePackage('tab-title');

        waitsForPromise(() => {
            return atom.packages.activatePackage('tabs');
        });

        waitsForPromise(() => {
            return activationPromise;
        });
    });

    describe('when opening a new file', () => {

        it('should have a default title', () => {
            openNewFile();

            runs(() => {
                var tab = workspaceElement.querySelector('li.tab');
                expect(tab.innerText).toEqual('Untitled');
            });
        });

        it('should have a customizable default title', () => {
            atom.config.set('tab-title.defaultTitle', 'Flight 815');

            openNewFile();

            runs(() => {
                verifyTabTitle('Flight 815');
            });
        });
    });

    describe('when editing the contents of an unsaved file', () => {
        var editor;

        beforeEach(() => {
            openNewFile();

            runs(() => {
                editor = atom.workspace.getActiveTextEditor();
            });
        });

        it('changes the title to the contents of the first line', () => {

            runs(() => {
                editor.setText('Have a cluckity-cluck-cluck day, Hugo!');
                verifyTabTitle('Have a cluckity-cluck-cluck day, Hugo!');
            });
        });

        it('gets the default title when the editor is cleared', () => {

            runs(() => {
                editor.setText('Have a cluckity-cluck-cluck day, Hugo!');
                verifyTabTitle('Have a cluckity-cluck-cluck day, Hugo!');

                editor.setText('');
                verifyTabTitle('Untitled');
            });
        });
    });

    describe('when closing files', () => {
        beforeEach(() => {
            jasmine.attachToDOM(workspaceElement);

            openNewFile();

            runs(() => {
                editor = atom.workspace.getActiveTextEditor();
                editor.setText('Jacob had a thing for numbers.');
            });

        });

        it('closes without error when the renamed tab is the last one', () => {
            var activePane = atom.workspace.getActivePane();
            expect(() => { activePane.destroyActiveItem(); }).not.toThrow();
        });

        it('keeps the new name when closing other files', () => {

            openNewFile();

            runs(() => {
                editor = atom.workspace.getActiveTextEditor();
                editor.setText('What lies in the shadow of the statue?');

                verifyTabTitle('What lies in the shadow of the statue?', 1);

                atom.workspace.getActivePane().destroyActiveItem();

                verifyTabTitle('Jacob had a thing for numbers.');
            });
        });
    });

    describe('when moving unsaved tabs', () => {
        it('keeps the new name', () => {
            // open two files so that we have items to switch
            openNewFile();

            runs(() => {
                editor = atom.workspace.getActiveTextEditor();
                editor.setText('If you two are done verbally copulating, we should get a move on.');
            });

            openNewFile();

            runs(() => {
                editor = atom.workspace.getActiveTextEditor();
                editor.setText('My name is Henry Gale.');

                // swap the tabs
                atom.commands.dispatch(workspaceElement, 'pane:move-item-left');

                // wait a little before verifying the name change, as the DOM
                // doesn't update until the event has been handled
                setTimeout(() => { verifyTabTitle('My name is Henry Gale.'); }, 20);
            });

        });
    });

    describe('window title', () => {
        it('gets truncated when it reaches the max allowed length', () => {
            atom.config.set('tab-title.maxTitleLength', 8);

            openNewFile();

            runs(() => {
                var editor = atom.workspace.getActiveTextEditor();
                editor.setText('So we saved the world together for a while, and that was lovely.');
                expect(document.title).toEqual('So we sa...');
            });
        });
    });

    function openNewFile(){
        waitsForPromise(() => {
            return atom.workspace.open();
        });
    }

    function verifyTabTitle(title, index){
        var tab = workspaceElement.querySelectorAll('li.tab')[index || 0];
        expect(tab.innerText.trim()).toEqual(title);
    }
});
