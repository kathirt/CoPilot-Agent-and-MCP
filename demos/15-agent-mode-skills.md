# Demo 7: Using GitHub Copilot Chat in Agent Mode with a Custom Skill

> [!NOTE]
> This is a demo so it means that the trainer has to run the demo himself

In this demo, we will use GitHub Copilot Chat in Agent Mode to create a custom skill with the `/create-skill` prompt, then use that skill to resize images with a Python script.

The skill will generate four output sizes for each image:

- large
- medium
- small
- thumbnail

This demonstrates how Agent Mode can execute a reusable workflow that combines repository context, instructions, and scripts.

## Prerequisites

- A GitHub account with Copilot enabled and access to Agent Mode.
- An IDE with GitHub Copilot Chat enabled and configured to use Agent Mode.
- Python 3.9+ installed.

## Environment configuration

- Create a new repository from [ps-copilot-sandbox/copilot-agent-and-mcp](https://github.com/ps-copilot-sandbox/copilot-agent-and-mcp) which is a template repository or reuse the repository created in previous demos.
- Clone the repository on your laptop.
- Use the instructions in the [`README.md` file](/README.md) to setup your development environment.
- Open the repository in your IDE.

## Step-by-step demo flow

### Step 1 - Explain skill objectives

Tell the audience that the skill should:

- Accept an input image or folder.
- Generate 4 sizes: large, medium, small, thumbnail.
- Save outputs under `images/resized`.
- Preserve aspect ratio.

### Step 2 - Open Agent Mode and prepare context

1. Go to your IDE.
2. Open GitHub Copilot Chat in Agent Mode.
3. Go to step 3.

### Step 3 - Create the skill with `/create-skill`

Use the following prompt in Agent Mode:

```prompt
/create-skill Create a skill named resize-images.
The skill should use only Python and Pillow to resize images into large, medium, small, and thumbnail variants.
Requirements:
- Create .github/skills/resize-images/SKILL.md
- Create .github/skills/resize-images/resize_images.py
- Support input file or input directory
- Save outputs to images/resized by default
- Preserve aspect ratio
- Support extensions: .png, .jpg, .jpeg, .webp
- Add flags for --input, --output, --sizes, and --overwrite
- Include usage examples in SKILL.md
```

Let Copilot generate the skill files and explain how it infers folder conventions and implementation details.

### Step 4 - Validate generated files

Review the generated files with the audience:

- [`.github/skills/resize-images/SKILL.md`](/.github/skills/resize-images/SKILL.md)
- [`.github/skills/resize-images/resize_images.py`](/.github/skills/resize-images/resize_images.py)

Highlight that `SKILL.md` provides the behavior contract and that `resize_images.py` contains the executable logic.

### Step 5 - Install dependency

Run:

```bash
python -m pip install pillow
```

### Step 6 - Ask Agent Mode to execute the skill

Use this prompt:

```prompt
Use the resize-images skill to resize all PNG files in /images.
Save generated files in /images/resized and include all sizes: large, medium, small, thumbnail.
```

Explain that the agent can now reuse the created skill instead of rebuilding logic each time.

### Step 7 - Verify output

1. Open `images/resized`.
2. Confirm each source image has `_large`, `_medium`, `_small`, and `_thumbnail` outputs.
3. Optionally ask for a second run with only one size, for example:

```prompt
Use resize-images skill and generate only thumbnails for files in /images.
```

## Expected output example

If input includes `cover.png`, the script generates files like:

- `cover_large.png`
- `cover_medium.png`
- `cover_small.png`
- `cover_thumbnail.png`

## Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'PIL'` | Run `python -m pip install pillow`. |
| `/create-skill` is not recognized | Ensure you are in GitHub Copilot Chat Agent Mode and using a version that supports slash prompts. |
| No output files generated | Verify that input path exists and contains supported image files (`.png`, `.jpg`, `.jpeg`, `.webp`). |
| Images are distorted | The script preserves aspect ratio automatically. If distortion appears, verify source files are valid and not already stretched. |

## Further reading

- [GitHub Copilot customizations](https://docs.github.com/en/copilot/how-tos/custom-instructions)
- [GitHub Copilot agent skills](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/cloud-agent/add-skills)