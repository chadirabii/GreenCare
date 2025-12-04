"""
This package init is intentionally left minimal.

Pytest configuration should live in a top-level pytest.ini or
pyproject.toml. The previous pytest-style content was misplaced
in a Python module and caused a SyntaxError when Django imported
the package. Move pytest settings to pytest.ini if needed.
"""