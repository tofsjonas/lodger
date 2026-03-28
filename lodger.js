(function (document, localStorage) {
  const form = document.querySelector("form");
  var file_input = document.getElementById("file-input");

  function form2array(frm) {
    var result = {};
    Array.prototype.slice.call(frm.elements).forEach(function (element) {
      var name = element.name;
      if (element.type === "radio") {
        if (element.checked) {
          result[name] = element.value;
        }
      } else {
        result[name] =
          element.checked || element.type !== "checkbox" ? element.value : "";
      }
    });
    return result;
  }

  function setFormValue(form, name, value) {
    var elements = form.querySelectorAll('[name="' + name + '"]');
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var type = element.type;
      switch (type) {
        case "radio":
          element.checked = element.value === value;
          break;
        case "checkbox":
          element.checked = value;
          break;
        default:
          element.value = value;
      }
    }
  }

  function saveTextFile(e) {
    var d = new Date();
    var filename =
      "lodger-contract_" + d.toISOString().substring(0, 10) + ".json";
    var txt = JSON.stringify(form2array(form));
    var file = new File([txt], filename, {
      type: "application/json",
    });
    var url = URL.createObjectURL(file);
    var link = document.createElement("a");

    link.type = "file";
    link.href = url;
    link.download = filename;
    // link.setAttribute( "download", "lodger-contract.json" );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printDoc() {
    window.print();
  }

  document.getElementById("save").onclick = saveTextFile;
  document.getElementById("print").onclick = printDoc;

  // Debounce function to limit how often the URL is updated
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Update the URL with the JSON data
  function updateURLWithJSON() {
    const json = JSON.stringify(form2array(form));
    const encodedJSON = encodeURIComponent(json);
    const newURL = `${window.location.pathname}?json=${encodedJSON}`;
    history.replaceState(null, "", newURL);
  }

  // Populate the form from the JSON query parameter
  function populateFormFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const json = params.get("json");
    if (json) {
      try {
        const values = JSON.parse(decodeURIComponent(json));
        for (const key in values) {
          setFormValue(form, key, values[key]);
        }
      } catch (e) {
        console.error("Invalid JSON in URL query parameter:", e);
      }
    }
  }

  file_input.addEventListener("change", function (e) {
    var file = file_input.files[0];
    var text_type = /.json$/;

    if (file.type.match(text_type)) {
      var reader = new FileReader();

      reader.onload = function (e) {
        values = JSON.parse(reader.result);
        // console.log( values );
        for (var i in values) {
          setFormValue(form, i, values[i]);
        }
      };

      reader.readAsText(file);
    } else {
      console.log("File not supported!");
    }
  });

  // Autosave to localStorage and update URL
  document.addEventListener(
    "input",
    debounce(function (e) {
      localStorage.lodger = JSON.stringify(form2array(form));
      updateURLWithJSON();
    }, 300)
  );

  // Auto-resize textarea
  document.addEventListener("keypress", function (e) {
    const object = e.target;
    if (object.nodeName === "TEXTAREA") {
      setTimeout(function () {
        object.style.height = "auto"; // auto must be set first
        object.style.height = object.scrollHeight + "px";
      }, 10);
    }
  });

  // Populate form from localStorage or URL query parameter
  const json_str = localStorage.lodger;
  if (json_str) {
    const values = JSON.parse(json_str);
    for (const key in values) {
      setFormValue(form, key, values[key]);
    }
  }
  populateFormFromQuery();
})(document, localStorage);
