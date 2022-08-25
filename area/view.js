(async () => {
  const pages = await dv.pages(`[[Areas/${input.area}]]`).sort(function(a, b) {
    return b && b.file ? a.file.name - b.file.name : a.file.name;
  });

  const items = await pages.values.reduce(async (result, page) => {
    const matches = [];
    const lines   = (await dv.io.load(page.file.path)).split("\n");

    for (let line of lines) {
      // Ensure the line belongs to the request area.
      if (line.indexOf(`[[Areas/${input.area}]]`) === -1 && line.indexOf(`[[${input.area}]]`) === -1) {
        continue;
      }

      // Ensure excluded content, such as a tag, is not contained within the line.
      if (input.exclude && line.indexOf(input.exclude) !== -1) {
        continue;
      }

      // Ensure included content, such as a tag, is contained within the line.
      if (input.include && line.indexOf(input.include) === -1) {
        continue;
      }

      matches.push(
        // Extract the content before the dash.
        line.split(" — ", 2)[0].replace(/^- /, "") +
        // Include a dimmed link to the source page.
        "<span style=\"opacity: 0.25;\"> — [[" + page.file.path + "|" + page.file.name + "]]</span>"
      );
    }

    return (await result).concat(matches);
  }, []);

  if (items.length) {
    if (input.title) {
      dv.header(2, input.title);
    }

    dv.list(items.reverse());
  }
})();
