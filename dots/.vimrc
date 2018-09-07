nnoremap <up> gk
nnoremap <down> gj

set encoding=utf-8                 " encoding scheme for displaying
set ruler                          " always show crusor
set showmatch                      " highlight braces
set showmode                       " show insert/replace/visual mode

" write settings
set confirm                        " confirm :q
set fileencoding=utf-8             " encoding for saving
set nobackup                       " do not keep backups

" tabbing stuff, 4 spaces
set tabstop=4                      " tabs indent spaces
" set shiftwidth=4                   " spaces for indentation
set softtabstop=4                  " space
set noexpandtab                    " set settings
set autoindent
set smartindent
filetype indent on

set pastetoggle=<f5>

" tabbing
map <f7> <esc>:tabp <cr>
map <f8> <esc>:tabn <cr>

" search stuff
set incsearch                      " highlight as you type
set hlsearch
set ignorecase
set smartcase
set backspace=indent,eol,start
set laststatus=2                   " always show mode and things
set number                         " line numbers

" show tabs and stuff
set list
set showbreak=→
set listchars=tab:•\ ,precedes:←,extends:→,trail:●

" color scheme
color slate
set background=dark
syntax on
set cursorline
set cursorcolumn
hi CursorColumn cterm=bold ctermfg=White ctermbg=Black
hi CursorLine cterm=bold ctermbg=Black

set timeoutlen=500 ttimeoutlen=0
set wildmenu                       " tab for autocomplete menu
