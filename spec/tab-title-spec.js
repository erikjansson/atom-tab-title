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
            atom.config.set('tab-title.defaultPlaceholder', 'Flight 815');

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
                editor.setText('The Others are coming!');
                verifyTabTitle('The Others are coming!');
            });
        });

        it('gets the default title when the editor is cleared', () => {

            runs(() => {
                editor.setText('The Others are coming!');
                verifyTabTitle('The Others are coming!');

                editor.setText('');
                verifyTabTitle('Untitled');
            });
        });
    });

    function openNewFile(){
        waitsForPromise(() => {
            return atom.workspace.open();
        });
    }

    function verifyTabTitle(title){
        var tab = workspaceElement.querySelector('li.tab');
        expect(tab.innerText).toEqual(title);
    }
});
