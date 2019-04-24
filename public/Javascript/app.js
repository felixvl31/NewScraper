$(document).ready(function() {
  var path = window.location.pathname;
  var newsContainer = $(".news-container");
  $(document).on("click", ".scrape-new", handleScrape);
  $(document).on("click", ".clear", handleClear);
  $(document).on("click", ".btn.save", handleSave);
  $(document).on("click", ".btn.unsave", handleUnsave);
  $(document).on("click", ".notes", handleNotes);
  $(document).on("click", "#savenote", handleNoteSave);
  $(document).on("click", ".note-delete", handleNoteDelete);

  function initPage() {
    $.get("/api/news").then(function(data) {
      newsContainer.empty();
      if (data && data.length) {
        renderNews(data);
      } else {
        renderEmpty();
      }
    });
  }
  function showSavedNews() {
    $.get("/api/saved").then(function(data) {
      newsContainer.empty();
      if (data && data.length) {
        renderSaved(data);
      } else {
        renderEmptySaved();
      }
    });
  }

  function renderNews(news) {
    var newsCards = [];
    for (var i = 0; i < news.length; i++) {
      newsCards.push(createCard(news[i]));
    }
    newsContainer.append(newsCards);
  }
  function renderSaved(news) {
    var newsCards = [];
    for (var i = 0; i < news.length; i++) {
      newsCards.push(createsavedCard(news[i]));
    }
    newsContainer.append(newsCards);
  }

  function createCard(news) {
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        `
        <div class="row align-items-center">
          <div class= "col-9 col-md-10 text-center">
            <a class='article-link' target='_blank' rel='noopener noreferrer' href=${"https://www.nytimes.com" + news.link}>${news.title}</a>
          </div>
          <div class= "col-3 col-md-2 text-center">
            <a class='align-bottom btn btn-success save'>Save</a>
          </div>
        </div>
        `
      )
    );

    var cardBody = $("<div class='card-body'>").text(news.body);

    card.append(cardHeader, cardBody);
    card.data("_id", news._id);
    return card;
  }
  function createsavedCard(news) {
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        `
        <div class="row align-items-center">
          <div class= "col-9 col-md-10 text-center">
            <a class='article-link' target='_blank' rel='noopener noreferrer' href=${"https://www.nytimes.com" + news.link}>${news.title}</a>
          </div>
          <div class= "buttonsSaved col-3 col-md-2 text-center">
            <a class='btn btn-danger unsave'>Remove</a>
            <button type='button' class="btn btn-primary notes" data-toggle='modal' class='notes' data-target='.modal' data-id='${news._id}'>Notes</button>
          </div>
        </div>
        `
      )
    );

    var cardBody = $("<div class='card-body'>").text(news.body);

    card.append(cardHeader, cardBody);
    card.data("_id", news._id);
    return card;
  }

  function renderEmpty() {
    var emptyAlert = `
        <div class='alert alert-warning text-center'>
         <h4>No news at all, try scrapping some.</h4>
        </div>
        <div class='card'>
          <div class='card-header text-center'>
            <h3>What Would You Like To Do?</h3>
          </div>
          <div class='card-body text-center'>
            <h4><a class='scrape-new  empty'>Try scraping new articles</a></h4>
          </div>
        </div>`;
    newsContainer.append(emptyAlert);
  }
  function renderEmptySaved() {
    var emptyAlert = `
        <div class='alert alert-warning text-center'>
          <h4>No saved news.</h4>
        </div>
        <div class='card'>
          <div class='card-header text-center'>
            <h3>What Would You Like To Do?</h3>
          </div>
          <div class='card-body text-center'>
            <h4><a class="GoToSaved" href='/'>Go back and save some articles</a></h4>
          </div>
        </div>`;
    newsContainer.append(emptyAlert);
  }

  function handleScrape() {
    $.get("/scrape").then(function(data) {
      newsContainer.empty();
      window.location.pathname = "/";
    });
  }
  function handleClear() {
    $.get("api/delete").then(function() {
      newsContainer.empty();
      window.location.pathname = "";
    });
  }
  function handleSave() {
    var newToSave = $(this)
      .parents(".card")
      .data();

  
    $(this)
      .parents(".card")
      .remove();

    newToSave.saved = true;
    $.ajax({
      method: "PUT",
      url: "/api/save/" + newToSave._id,
      data: newToSave
    }).then(function(data) {
      if (data.saved) {
        initPage();
      }
    });
  }
  function handleUnsave() {
   
    var newToUnsave = $(this)
      .parents(".card")
      .data();

    $(this)
      .parents(".card")
      .remove();

    newToUnsave.saved = false;
    $.ajax({
      method: "PUT",
      url: "/api/unsave/" + newToUnsave._id,
      data: newToUnsave
    }).then(function(data) {
      if (!data.saved) {
        showSavedNews();
      }
    });
  }

 
  function handleNotes() {
    $("#notes").empty();
    $("#saveButton").empty();
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/api/news/" + thisId
    })
      .then(function(data) {
        $(".modal-title").text(`Notes for... `+data.title);

        if (data.note) {
          for (var i=0;i<data.note.length;i++) {
          var item = `
          <li class="list-group-item note"> 
            <div class="row align-items-center">
              <div class="col-10">
                <a>${data.note[i].body}</a>
              </div>

              <div class="col-2">
              <button class="btn btn-danger note-delete" data-id=${data.note[i]._id}>X</button>
              </div>
            </div>
          </li>
          `;
          $("#notes").append(item);
        }
        }
        $("#saveButton").append(
          `<button class="btn btn-primary" data-id=${data._id} id='savenote'>Save Note</button>`
        );

      });
  }
  function handleNoteSave() {
    var thisId = $(this).attr("data-id");
    var noteData;
    var newNote = $(".textNote")
      .val()
      .trim();
    if (newNote) {
      noteData = {
        body: newNote
      };
      $.ajax({
        method: "POST",
        url: "/api/news/" + thisId,
        data: noteData
      }).then(function(data) {
        $(".textNote").val("");
        $('.modal').modal('hide');
      });
    }
  }
  function handleNoteDelete() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      url: "/api/notedelete/" + thisId,
      method: "DELETE"
    }).then(function() {
      $('.modal').modal('hide');
    });
  }

  if (path === "/") {
    initPage();
  } else if (path === "/saved") {
    showSavedNews();
  }
});
