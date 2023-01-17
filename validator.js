function Validator({ form, formGroup, formMessage, onSubmit }) {
  var formRules = {};
  /**
   * Quy ước tạo rule:
   * - Nếu có lỗi thì return `error message`
   * - Nếu không có lỗi thì return undefined
   */
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này! ";
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Vui lòng nhập email";
    },
    min: function (min) {
      return function (value) {
        return value.length <= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length >= max
          ? undefined
          : `Vui lòng nhập ít nhất ${max} kí tự`;
      };
    },
  };
  const formElement = document.querySelector(form);
  if (!formElement) return;
  var inputs = formElement.querySelectorAll("[name][rules]");
  for (var input of inputs) {
    var rules = input.getAttribute("rules").split("|");
    for (var rule of rules) {
      var isRuleHasValue = rule.includes(":");
      var ruleInfo;
      if (isRuleHasValue) {
        ruleInfo = rule.split(":");
        rule = ruleInfo[0];
      }
      var ruleFn = validatorRules[rule];
      if (isRuleHasValue) {
        ruleFn = ruleFn(ruleInfo[1]);
      }
      if (Array.isArray(formRules[input.name])) {
        formRules[input.name].push(ruleFn);
      } else {
        formRules[input.name] = [ruleFn];
      }
    }
    // Lắng nghe sự kiện để validate (blue, change)
    input.onblur = handleValidate;
    input.oninput = handleClearError;
  }
  function handleValidate(event) {
    var rules = formRules[event.target.name];
    var errorMessage;
    for (const rule of rules) {
      errorMessage = rule(event.target.value);
      if (errorMessage) break;
    }
    var formGroupElement = event.target.closest(formGroup);
    if (!formGroupElement) return;
    var errorElement = formGroupElement.querySelector(formMessage);
    if (!errorElement) return;
    if (errorMessage) {
      formGroupElement.classList.add("invalid");
      errorElement.innerText = errorMessage;
    } else {
      errorElement.innerText = "";
      formGroupElement.classList.remove("invalid");
    }
    return !errorMessage;
  }

  function handleClearError(event) {
    var formGroupElement = event.target.closest(formGroup);
    if (!formGroupElement) return;
    var errorElement = formGroupElement.querySelector(formMessage);
    if (formGroupElement.classList.contains("invalid")) {
      formGroupElement.classList.remove("invalid");
      errorElement.innerText = "";
    }
  }
  // submit form
  formElement.onsubmit = function (event) {
    event.preventDefault();
    var inputs = formElement.querySelectorAll("[name][rules]");
    var isValid = true;
    for (var input of Array.from(inputs)) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }
    // Khi không có lỗi thì submit form
    if (isValid) {
      if (typeof onSubmit === "function") {
        var enableInputs = formElement.querySelectorAll(
          "[name]:not([disabled])"
        );
        var formValues = Array.from(enableInputs).reduce((values, input) => {
          switch (input.type) {
            case "checkbox": {
              if (input.checked) {
                values[input.name] = Array.isArray(values[input.name])
                  ? [...values[input.name], input.value]
                  : [input.value];
              } else {
                values[input.name] = Array.isArray(values[input.name])
                  ? [...values[input.name]]
                  : [];
              }
              break;
            }
            case "radio": {
              input.checked && (values[input.name] = input.value);
              break;
            }
            case "file": {
              values[input.name] = input.files;
              break;
            }
            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});
        onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
