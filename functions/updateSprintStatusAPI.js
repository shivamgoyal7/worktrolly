/* eslint-disable object-curly-spacing */
/* eslint-disable no-undef */
/* eslint-disable require-jsdoc */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable max-len */
// eslint-disable-next-line no-dupe-else-if

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

const admin = require("firebase-admin");

const db = admin.firestore();

exports.updateSprintStatus = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const sprintStatus = request.body.data.SprintStatus;
        const currentSprintName = request.body.data.CurrentSprintName;
        console.log(currentSprintName);
        db.collection("Main").doc(currentSprintName).update({
                Status: sprintStatus,
            }).then(() => {
                console.log("Sprint updated successfully");
                result = { data: "OK" };
                return response.status(200).send(result);
            })
            .catch((error) => {
                result = { data: error };
                console.error("Error updating Sprint", error);
                return response.status(500).send(result);
            });
    });
});