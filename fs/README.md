![Cavalion Logo](/home/icon.png)

# /fs folder

The /fs _folder_ is the root folder of a file system exposed through a simple API (-[described here](https://google.com/?q=please%20describe)-) served at the /fs _endpoint_ . One might create symbolic links to directories here in order to unlock source codes for editing using the web application being served at /code. For example:

* `cd static`
* `ln -s ~/Dropbox Dropbox`
* `ln -s ~/Downloads Downloads`
* `ln -s ~/Projects Projects`

**Note:** The files and folder linked here become CRUD-ly accessible through the Navigator in [/code](/code).

# Keyboard shortcuts

## General
- **Shift+Cmd+0** - Toggle sidebar
- **Cmd+1-9** - Focus workspace 1-9, keeping pressing to switch focus between sidebar and editor
- **Alt+Cmd+1-9** - Focus tab 1-9 in sidebar
- **Escape** - Focus editor
- **Shift+Alt+X** - Toggle console
- **Ctrl+Escape** - Toggle console
- **Ctrl+Alt+[]** - Select previous/next workspace
- **Ctrl+Alt+Cmd+[]** - Move tab active workspace 

## Navigator
- **F5** - Refresh children focused node or root node
- **F8** - Delete selected resource
- **F9** - Create new resource
- **Ctrl+N** - New resource

## Editor
- **Ctrl+N** - Next line (blocking Navigator Ctrl+N)
- **Cmd+,** - Show Ace settings
- **Cmd+S** - Save
- **Cmd+R** - Reload/Revert
- **Cmd+0** - Focus in Navigator (might need to be press multiple times in a row)
- **Ctrl+Shift+[]** - Select previous/next editor
- **Ctrl+Shift+Cmd+[]** - Move tab active editor

#### Editor<vcl>
- **Shift+Cmd+X** - Toggle Component
- **Shift+Cmd+S** - Toggle Source