NEW_DIR="gptzero-frontend-challenge"

# Delete the directory if it exists
rm -rf ../$NEW_DIR

# Copy the current directory to the parent directory
# excluding the node_modules and .next directories.

rsync -a --exclude=node_modules --exclude=.next . ../$NEW_DIR

# cd into that directory

cd ../$NEW_DIR

# Compress all the git commits in the history into a single commit with the message "Assessment"
# Use rebase, non-interactive mode, and squash all commits into one

git reset $(git commit-tree HEAD^{tree} -m "Assessment")