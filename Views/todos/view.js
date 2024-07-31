(async () => {
  const pages = await dv.pages().sort(function(a, b) {
    return b && b.file ? a.file.name - b.file.name : a.file.name;
  });

  let inTaskList = false,
    previousLines = [];

  const items = await pages.values.reduce(async (result, page) => {
    const matches = [];
    const lines   = (await dv.io.load(page.file.path)).split("\n");

    for (let line of lines) {
      const list  = !!line.match(/^\s*- /);
      const start = !!line.match(/^- /);
      const task  = !!line.match(/^\s*- \[\s\] /);

      if (!list) {
        continue;
      }

      if (task) {
        inTaskList = true;

        if (!start) {
          previousLines.forEach((previousLine) => {
            matches.push(previousLine);
          });
        }

        previousLines = [];
      } else if (start) {
        inTaskList = false;
        previousLines = [line];
        continue;
      } else if (list && inTaskList) {
        previousLines.push(line);
        continue;
      } else {
        inTaskList = false;
        continue;
      }

      // Extract the content after the to-do marker.
      const title = line.replace("- [ ]", "-").replace(/\t/g, "  ");

      // Ignore empty to-do items.
      if (title.trim() === "-") {
        continue
      }

      matches.push(
        title +
        // Include a dimmed link to the source page.
        "<span style=\"opacity: 0.25;\"> — [[" + page.file.path + "|" + page.file.name + "]]</span>"
      );
    }

    return (await result).concat(matches);
  }, []);

  if (items.length) {
    dv.el("div", items.join("\n"));
  }
})();
