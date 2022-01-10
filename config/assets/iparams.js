var updateConfig;
app.initialized().then(function (client) {
    $("#selectedTaskFields").select2({
        closeOnSelect: false
    });
    $("#orgError, #workError, #taskError").hide();
    $("#selectedWorkspace").prop("disabled", true);
    window.client = client;
    getOrganization(client);
    $("#selectedOrganization, #selectedWorkspace, #selectedTaskFields").change(function () {
        $("#orgError, #workError, #taskError, #error_div").hide();
    });
    $(document).on('change', "#selectedOrganization", function () {
        $("#selectedWorkspace").prop("disabled", false);
        var org_id = $("#selectedOrganization").val();
        if (org_id !== null) {
            getWorkSpace(client, org_id);
        }
    });
    $(document).on("fwFocus", "#fdAPIDomain", function () {
        $("#orgError, #workError, #taskError, #error_div").hide();
        $("#fdAPIDomain").attr("state", "normal");
        $("#fdAPIDomain").attr("state-text", "Please enter freshdesk API domain URL. Ex: example.freshdesk.com.");
    });
});

function getOrganization(client) {
    var baseUrl = "https://api.podio.com";
    var headers = {
        "Authorization": "Bearer <%= access_token %>",
        "Content-Type": "application/json;charset=utf-8"
    };
    var options = {
        headers: headers,
        isOAuth: true
    };
    var orgUrl = baseUrl + "/org";
    client.request.get(orgUrl, options).then(function (orgData) {
            var result = JSON.parse(orgData.response);
            var org = [];
            var orgId, orgName;
            org.push(`<option selected>select</option>`);
            $.each(result, function (k, v) {
                orgId = v.org_id;
                orgName = v.name;
                org.push(`<option value="${orgId}">${orgName}</option>`);
            });
            $("#selectedOrganization").html(org.join(""));
            if (updateConfig !== undefined) {
                $('#selectedOrganization').val(updateConfig.orgID).trigger('change');
            }
        },
        function (error) {
            handleError(error);
        });
}

function getWorkSpace(client, org_id) {
    var baseUrl = "https://api.podio.com";
    var spaceUrl = baseUrl + "/org/" + org_id + "/space";
    var headers = {
        "Authorization": "Bearer <%= access_token %>",
        "Content-Type": "application/json;charset=utf-8"
    };
    var options = {
        headers: headers,
        isOAuth: true
    };
    client.request.get(spaceUrl, options).then(function (spaceData) {
        var space = JSON.parse(spaceData.response);
        var ws = [];
        ws.push(`<option selected>select</option>`);
        $.each(space, function (k, v) {
            var ws_id = v.space_id;
            var ws_name = v.name;
            ws.push(`<option value="${ws_id}">${ws_name}</option>`);
        });
        $("#selectedWorkspace").html(ws);
        if (updateConfig !== undefined) {
            $("#selectedWorkspace").val(updateConfig.workSpaceID).trigger('change');
            $("#selectedTaskFields").val(updateConfig.selectedTask).trigger('change');
        }
    }, function (error) {
        handleError(error);
    });
}

function handleError(e) {
    if (e.status === 400) {
        $("#error_div").show().html("Unable to process request.");
    } else if (e.status === 429) {
        $("#error_div").show().html("Too many requests were made, please try after sometime.");
    } else if (e.status === 502) {
        $("#error_div").show().html("Error due to network issue, please try again.");
    } else if (e.status === 504) {
        $("#error_div").show().html("Timeout error while processing the request.");
    } else {
        $("#error_div").show().html("Unexpected error occurred, please try after sometime.");
    }
}

function validate() {
    var isValid = true;
    let orgID = $("#selectedOrganization").val();
    let workSpaceID = $("#selectedWorkspace").val();
    let selectedTask = $("#selectedTaskFields").val();
    let fdAPIDomain = $("#fdAPIDomain").val().trim();
    if (fdAPIDomain.length === 0) {
        isValid = false;
        $("#fdAPIDomain").attr("state", "error");
        $("#fdAPIDomain").attr("state-text", "This field is mandatory.");
    }
    if (selectedTask.length === 0) {
        isValid = false;
        $("#taskError").show().text("This field is mandatory.");
    }
    if (workSpaceID === null) {
        isValid = false;
        $("#workError").show().text("This field is mandatory.");
    }
    if (orgID === "select") {
        isValid = false;
        $("#orgError").show().text("This field is mandatory.");
    }
    return isValid;
}