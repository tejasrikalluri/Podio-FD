$(document).ready(function () {
  app.initialized().then(function (_client) {
    $("#mainDiv").hide();
    var podioClient = _client;
    var podioClient = _client;
    var dtToday = new Date();
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();
    var minDate = year + '-' + month + '-' + day;
    $("#date").prop('min', minDate);
    $("#date").click(function () {
      $("#createTaskError, #successMsg, #taskNameError, #dateError").hide();
    });
    $('#st_contact').select2({
      'width': '95%'
    });
    $("#createTaskError, #successMsg, #mainDiv, #taskNameError, #errorMsg, #dateError").hide();
    $('#load').show().html("Loading please wait...");
    ticketInfo(podioClient, function (ticketData) {
      $('#task_title').val(ticketData.subject);
      $('#task_desc').val(ticketData.description);
      $('#load').html("").hide();
      appendContacts(podioClient);
    });
    $("#create").click(function () {
      $("#create").prop("disabled", true);
      $("#create").text("Creating Task");
      $("#createTaskError, #successMsg, #taskNameError").hide();
      checkTaskName(podioClient);
    });
    $("#task_title, #task_desc").click(function () {
      $("#createTaskError, #successMsg, #taskNameError, #dateError").hide();
      enableButton();
    });
    $("#st_contact, #date").change(function () {
      $("#createTaskError, #successMsg, #taskNameError, #dateError").hide();
      enableButton();
    });
  }, function (error) {
    handleError(error);
  });
  var ticketInfo = function (podioClient, callback) {
    podioClient.data.get("ticket").then(function (tdata) {
      var subject = tdata.ticket.subject;
      var description = tdata.ticket.description_text;
      var ticketId = tdata.ticket.id;
      var newObj = {
        "subject": subject,
        "description": description,
        "ticketId": ticketId
      };
      callback(newObj);
    }, function (error) {
      handleError(error);
    });
  }
  var getOrganizationID = function (podioClient, callback) {
    podioClient.iparams.get().then(function (iparamData) {
      var orgId = iparamData.orgID;
      var workspaceId = iparamData.workSpaceID;
      var fdCustomDomain = iparamData.fdCustomDomain;
      var iparamsObj = {
        "orgId": orgId,
        "workspaceId": workspaceId,
        "fdCustomDomain": fdCustomDomain
      };
      callback(iparamsObj);
    }, function (error) {
      handleError(error);
    });
  };
  var getDomainName = function (podioClient, callback) {
    podioClient.data.get("domainName").then(function (ddata) {
      var domain = ddata.domainName;
      callback(domain);
    }, function (error) {
      handleError(error);
    });
  }

  function appendContacts(podioClient) {
    $("#mainDiv").show();
    getOrganizationID(podioClient, function (iparamsObj) {
      var org_id = btoa(iparamsObj.orgId);
      var cOptions = {
        "orgId": org_id
      };
      $('#load').html("").hide();
      podioClient.request.invoke("getContacts", cOptions).then(function (contactData) {
        var result = contactData.response.body;
        var map = new Map();
        var contactList = [];
        if (result.length !== 0) {
          $.each(result, function (k, v) {
            map[k] = v;
            contactList.push("<option value=" + v + ">" + k + "</option>");
          });
        }
        $('#st_contact').html(contactList);
      }, function (error) {
        $('#load').hide().html("");
        $('#createTaskError').show().text("Unable to fetch the Responsible");
        handleError(error);
      });
    });
  }

  function checkTaskName(podioClient) {
    var taskName = $('#task_title').val().trim();
    let dateField = $("#date").val();
    if (taskName === "" || taskName === undefined || taskName === null || dateField === "") {
      reduceCheckTaskName(taskName);
    } else {
      createNewTask(podioClient);
    }
  }

  function reduceCheckTaskName(taskName) {
    if (taskName === "" || taskName === undefined || taskName === null) {
      $('#taskNameError').show().text("This field is Mandatory.");
    }
    if ($("#date").val() === "") {
      $('#dateError').show().text("This field is Mandatory.");
    }
    $("#create").prop("disabled", false);
    $("#create").text("Create Task");
  }

  function createNewTask(podioClient) {
    $('#load').show().html("Creating task, please wait...");
    getOrganizationID(podioClient, function (iparamsObj) {
      getDomainName(podioClient, function (domain) {
        ticketInfo(podioClient, function (ticketData) {
          var taskName = $('#task_title').val();
          var description = $('#task_desc').val();
          var contact_val = $('#st_contact').val();
          if (contact_val !== null) {
            contact_val = contact_val.map(Number);
          }
          var fdCustomDomain = iparamsObj.fdCustomDomain;
          var dueDate = $('#date').val();
          if (dueDate !== "Invalid Date") {
            var formattedDate = new Date(dueDate);
            var d = formattedDate.getDate();
            var m = formattedDate.getMonth();
            m += 1;
            var y = formattedDate.getFullYear();
            var date = y + "-" + m + "-" + d;
          } else {
            var date = null;
          }
          var domainVal;
          if (fdCustomDomain !== undefined && fdCustomDomain !== null && fdCustomDomain !== "") {
            domainVal = fdCustomDomain;
          } else {
            domainVal = domain;
          }
          var link_url = "https://" + domainVal + "/a/tickets/" + ticketData.ticketId;
          description += "\nTicket: " + link_url;
          var bodyData = {
            text: taskName,
            description: description,
            ref_type: 'space',
            ref_id: iparamsObj.workspaceId,
            responsible: contact_val,
            due_date: date
          };
          var encodeBody = btoa(JSON.stringify(bodyData));
          var options = {
            body: encodeBody
          };
          podioClient.request.invoke('createTask', options).then(function () {
            successBlockOfCreateTask(podioClient);
          }, function (error) {
            errorBlockOfCreateTask(error);
          }); // request
        });
      });
    });
  }

  function errorBlockOfCreateTask(error) {
    $('#load').hide().html("");
    if (error.status === 400) {
      $('#createTaskError').show().text("Please provide valid Task details.");
    } else {
      $('#createTaskError').show().text("Failed to create task in your podio.");
    }
    setTimeout(function () {
      enableButton();
    }, 2000);
  }

  function successBlockOfCreateTask(podioClient) {
    $('#load').hide().html("");
    $('#successMsg').show().text("Task created successfully in your Podio");
    $("#create").prop("disabled", true);
    $("#create").text("Created Task");
    setTimeout(function () {
      closeModal(podioClient);
    }, 2000);
  }

  function enableButton() {
    $("#create").prop("disabled", false);
    $("#create").text("Create Task");
  }
});