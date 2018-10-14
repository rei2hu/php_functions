source /usr/share/git/completion/git-prompt.sh

# \u   username
# \h   hostname
# \W   working directory
# \$   # if root, $ if not

# \e[  start colors
# ...m stop colors
# x;y  colors x light y color

# \[   dont print this sequence, for colors and other stuff
# \]   end the sequence of non print

# https://www.gnu.org/software/bash/manual/bashref.html#index-prompting
# https://jonasjacek.github.io/colors/

COLOR1='245'
COLOR2='137'
COLOR3='180'
USER='\[\e[48;5;${COLOR1}m\]\[\e[30m\] 🖳  \u'
JOBS='[\j]'
# JOBS='@'
HOST='\h '

limit_dir() {
	# or 40 letters long, should scale on column number
	if [ ${#PWD} -gt $(($COLUMNS / 2)) ]; then
		arr=(${PWD//\// })
		for i in "${arr[@]}"
		do
			# cut dir names to first letter
			if [ "$i" != ${arr[-1]} ]; then
				echo -n "/${i:0:1}"
			# except for last one
			else
				echo -n "/$i"
			fi
		done
	else
		echo -n "$PWD"
	fi
}

DIR='\[\e[48;5;${COLOR2}m\]\[\e[38;5;${COLOR1}m\] \[\e[30m\]🗁  $(limit_dir) '

git_status() {
	local hash=$(git log --pretty=format:'%h' -n 1 2> /dev/null)
	local content="-"
	if [ ! $hash == "" ]; then
		# how far ahead or behind you are compared to upstream branch
		local behind_ahead=$(git rev-list --count --left-right '@{upstream}...HEAD' 2> /dev/null)
		local ahead="${behind_ahead#*	}"
		local behind="${behind_ahead%	*}"

		# how many files are changed so far
		local total_changes=$(git status -s 2> /dev/null | wc -l)
		# how many files are staged
		local added_changes=$(git diff --cached --name-only 2> /dev/null | wc -l)

		content="  $(basename `git rev-parse --show-toplevel` 2> /dev/null)/$(__git_ps1 "%s") "
		content+="(${hash}) "
		if [ ! "0$behind" -eq 0 ]; then
			content+="${behind}-"
		fi
		if [ ! "0$behind" -eq 0 ] && [ ! "0$ahead" -eq 0 ]; then
			content+="/"
		fi
		if [ ! "0$ahead" -eq 0 ]; then
			content+="${ahead}+"
		fi

		if [ ! "0$total_changes" -eq 0 ]; then
			content+="  ($added_changes/$((total_changes-added_changes)))"
		fi
		# if untracked file, put asterisk
		if [ ! $(git ls-files --others --exclude-standard 2>/dev/null | sed q1) == "" ]; then
			content+="U"
		fi
	fi
	echo -e $content
}

GIT='\[\e[48;5;${COLOR3}m\]\[\e[38;5;${COLOR2}m\] \[\e[30m\]$(git_status) '
END='\[\e[m\]\[\e[38;5;${COLOR3}m\]'
EXTRA='\[\e[30m\]\[\e[48;5;${COLOR1}m\] \# \[\e[m\]\[\e[38;5;${COLOR1}m\]\[\e[m\] '

# http://www.tldp.org/HOWTO/Bash-Prompt-HOWTO/x405.html
# https://www.gnu.org/software/bash/manual/html_node/Bash-Variables.html
# https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html
# https://unix.stackexchange.com/questions/218323/keep-bash-input-on-top-line-of-screen
setup() {
	echo ""
	echo "" # so old output isn't overrided
	tput cup $(($LINES-3)) # go three lines before end to print prompts
	clearline # prevent dir line from moving up in case of ctrl c and similar
}
clearline() {
	tput el
	tput el1
}
listdir() {
	ls -1b $PWD | tr '\n' ' ' | cut -c 1-$COLUMNS
}
pre_cmd() {
	# dont clear stuff if its the prompt printing
	if [ "$BASH_COMMAND" = "$PROMPT_COMMAND" ]; then
		return
	fi
	tput sc # save position, where the output should start printing
	clearline # clear current prompt line, directory listing
	tput cud1 # move down 1
	clearline # clear line, the user/dir/git stuff
	tput rc # restore position
}
trap 'pre_cmd' DEBUG
PS1=''
PS1+="\[$(setup)\]"
PS1+="$EXTRA\[$(tput sc)\]\n"
PS1+='\[$(clearline;listdir;clearline)\]'
PS1+="$USER$JOBS$HOST$DIR$GIT$END\[$(tput rc)\]"

# it seems like termite depends on the last line for wrappin so because the last line
# is the longest, wrapping is messed up
