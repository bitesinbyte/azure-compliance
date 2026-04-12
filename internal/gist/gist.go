package gist

import (
	"context"
	"fmt"

	"github.com/google/go-github/v62/github"
)

// Update updates a GitHub Gist with the given content.
func Update(token, gistID, filename, content, description string) error {
	ctx := context.Background()
	client := github.NewClient(nil).WithAuthToken(token)

	gistFile := github.GistFile{
		Content:  github.String(content),
		Filename: github.String(filename),
	}

	input := &github.Gist{
		Description: github.String(description),
		Files: map[github.GistFilename]github.GistFile{
			github.GistFilename(filename): gistFile,
		},
	}

	_, _, err := client.Gists.Edit(ctx, gistID, input)
	if err != nil {
		return fmt.Errorf("failed to update gist %s: %w", gistID, err)
	}

	return nil
}
