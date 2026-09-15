document
    .getElementById("gigForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const message =
            document.getElementById("gigMessage");


        const gig = {

            creator_name:
                document.getElementById("gigCreator").value,

            title:
                document.getElementById("gigTitle").value,

            category:
                document.getElementById("gigCategory").value,

            rate:
                document.getElementById("gigRate").value,

            description:
                document.getElementById("gigDescription").value
        };


        message.textContent = "Publishing...";


        try {

            await api("/api/gigs", {

                method: "POST",

                body: JSON.stringify(gig)

            });


            document
                .getElementById("gigForm")
                .reset();


            message.textContent = "";


            showToast(
                "Your gig is now live! ✦"
            );


            loadGigs();

            showPage("marketplace");


        } catch (error) {

            message.textContent =
                error.message;
        }

    });
