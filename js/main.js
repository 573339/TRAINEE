//var inputTimer;
var db = openDatabase('traineeDB', '1.0', 'Trainee DB', 2 * 1024 * 1024);
var msg;
var topics;
var currentTopic='';
var prefix='NAVYTG';

//db init
db.transaction(function (tx) {
   //tx.executeSql('DROP TABLE NOTES');
   tx.executeSql('CREATE TABLE IF NOT EXISTS NOTES (ID INTEGER PRIMARY KEY ASC, title, note, modified DATETIME)');
   //tx.executeSql('DELETE FROM NOTES WHERE id=2');
   //tx.executeSql('INSERT INTO NOTES (title, note) VALUES ("Title 2", "Content 2")');
   //tx.executeSql('INSERT INTO NOTES (title, note) VALUES ("Title 3", "Content 3")');
   //msg = 'Log message created and row inserted.';
});

/*
db.transaction(function (tx) {
   tx.executeSql('SELECT * FROM NOTES', [], function (tx, results) {
      var len = results.rows.length, i;
      msg = "Found rows: " + len;
      console.log(msg);
		
      for (i = 0; i < len; i++){
         msg = results.rows.item(i).note;
         console.log(msg);
      }
   }, null);
});*/


//PLUGIN::containsIN
$.extend($.expr[":"], {
"containsIN": function(elem, i, match, array) {
return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
}
});

$(document).ready(function(){

   //implement fastclick
   FastClick.attach(document.body);
   
   function truncateTo(text,len){
      if (text.length>len){
         text=text.substr(0,len);
         text=text+'...';
      }
      return text;
   }

   //refresh notes pane from db
   function refreshNotes(){
      $('.all-notes').empty();
      db.transaction(function (tx) {   
         tx.executeSql('SELECT * FROM NOTES', [], function (tx, results) {
            var len = results.rows.length, i;
            msg = "Found rows: " + len;
            console.log(msg);
            
            if(len===1){
               $('#notes-counter').text(len+' note');
            }
            else{
               $('#notes-counter').text(len+' notes');
            }
            
            
            for (i = 0; i < len; i++){
               msg = results.rows.item(i).title;
               console.log(results.rows.item(i).ID, msg);
               
               var newNote='<a href="#" data-id="'+results.rows.item(i).ID+'" data-modified="'+results.rows.item(i).modified+'" class="note-link">'+
                  '<div class="note">'+
                     '<small class="date note-modified">'+results.rows.item(i).modified+'</small>'+
                     '<h4>'+truncateTo(results.rows.item(i).title,40)+'</h4>'+
                     '<p>'+truncateTo(results.rows.item(i).note,120)+'</p>'+
                  '</div>'+
               '</a>';
               $('.all-notes').append($(newNote));

            }
         }, null);
      });
   }

   //load data
   $.getJSON('topics.json',function(data){
      topics=data;
      startGuide();
   });

   //help accordions 
   $.getJSON('help.json',function(data){
      $.each(data,function(){
         var newHelp='<div class="help-item">'+
            '<div class="help-question">'+
               this.question +
            '</div>' +
            '<div class="help-answer">'+
               this.answer +
            '</div>' +
         '</div>';

         $(newHelp).appendTo('.help-items');
      });

      $('.help-question').click(function(){
         $(this).toggleClass('open').siblings('.help-answer').toggle();
      });

      //catalog search
      $('.help-search').keyup(function(){
         if($('.help-search').val()!=''){
            $('.help-item').hide();
            $('.help-question:containsIN("'+$('.help-search').val()+'")').parent().show();
         }
         else{
            $('.help-item').show();
         }
         
      });
   });

   function startGuide(){
      refreshNotes();

      //save new note
      $('.save-note-button').click(function(){
         var title=$('#new-note-title').val();
         var note=$('#new-note-note').val();
         var modified = new Date();

         db.transaction(function (tx) {
            tx.executeSql('INSERT INTO NOTES (title, note, modified) VALUES (?,?,?)',[title,note,(modified.getMonth()+1)+'/'+modified.getDate()+'/'+modified.getFullYear()],refreshNotes);
         });
      });

      //clear notes modal on hide
      $('#new-note, #edit-note').on('hidden.bs.modal',function(){
         $('#new-note .modal-input').val('');
      });


      //open edit note modal
      $('.all-notes').on('click','a',function(){
         var id=$(this).attr('data-id');

         db.transaction(function (tx) {   
            tx.executeSql('SELECT * FROM NOTES WHERE ID=?', [id], function (tx, results) {
               $('#edit-note-title').val(results.rows.item(0).title);
               $('#edit-note-note').val(results.rows.item(0).note);
               $('.edit-save-note-button').data('ID',results.rows.item(0).ID);
               $('.edit-delete-note-button').data('ID',results.rows.item(0).ID);
               $('#edit-note').modal();
            }, null);
         });      
      });

      //delete note button
      $('.edit-delete-note-button').click(function(){
         var ID=$(this).data('ID');
         console.log(ID);
         db.transaction(function (tx) {
            tx.executeSql('DELETE FROM NOTES WHERE ID=?',[ID],function(){
               refreshNotes();
            });
         });
      });

      //save edited note
      $('.edit-save-note-button').click(function(){
         var title=$('#edit-note-title').val();
         var note=$('#edit-note-note').val();
         var ID=$(this).data('ID');
         console.log(title,note,ID);

         db.transaction(function (tx) {
            tx.executeSql('UPDATE NOTES SET title=?, note=? WHERE ID=?',[title,note,ID],refreshNotes);
         });
      });









      //save study questions
      function saveStudy(){
         $('[data-save]').each(function(){
            localStorage.setItem(prefix+'/'+currentTopic+'-'+$(this).attr('data-save'),$(this).val());
            //localStorage.setItem($(this).attr('id'),$(this).val());
         });
      }

      //restore saved study questions
      function restoreStudy(){
         $('[data-save]').each(function(){
            $(this).val(localStorage.getItem(prefix+'/'+currentTopic+'-'+$(this).attr('data-save')));
         });
      }
      restoreStudy();

      //save study guides
      $('#portal').on('keyup','[data-save]',function(){
         saveStudy();
      });











      //generate section navigation
      function generateSectionNav(){
         $('#sectionNav').empty();
         $('#portal [data-sectionTitle]').each(function(){
            var newNavPoint='<li><a href="#" data-sectionTarget="'+$(this).attr('data-sectionTitle')+'"">'+$(this).attr('data-sectionTitle')+'</a></li>';
            $(newNavPoint).appendTo('#sectionNav');
         });
      }

      //generate topic navigation
      function generateTopicNav(){

         $.each(topics,function(index){
            var newTopicNav='<li><a href="'+index+'" class="">'+this.title+'</a></li>';
            $(newTopicNav).appendTo('#topicNav');
         });
      }

      //function to load new topics
      function loadTopic(topic){
         currentTopic=topic.id;
         $('#portal').load(topic.location,function(){
            $('#topic-title').text(topic.title);
            $('.hero').css('background-image','url(\''+topic.image+'\')');
            restoreStudy();
            generateSectionNav();
            $(window).scrollTop(0);
         });
      }

      //load initial content
      loadTopic(topics[0]);

      //generate topics list
      generateTopicNav();

      //click handler for topic navigation
      $('#topicNav').on('click','a',function(){
         loadTopic(topics[$(this).attr('href')]);
         $(this).addClass('selected').parent().siblings().children().removeClass('selected');
         $('.dropdown.open .dropdown-toggle').dropdown('toggle');
         return false;
      });

      //click handler for section navigation
      $('#sectionNav').on('click','a',function(){
         var el=$(this);

         $(window).scrollTop($('[data-sectionTitle="'+el.attr('data-sectionTarget')+'"]').offset().top-70);
         $('.dropdown.open .dropdown-toggle').dropdown('toggle');
         return false;

      });







      //search highlight
      $('#search').keyup(function(){
         var query=$(this).val();
         var el=$(this);

         // if(query.length>3){
         
         //    clearTimeout(inputTimer);
         //    inputTimer=setTimeout(function(){
         //       $('#portal').unhighlight().highlight(query);
         //       //$(window).scrollTop($('#portal .highlight').eq(0).offset().top-70);

         //       el.siblings('.fa').hide().siblings('#search-clear').show();
         //       $('#search-count').text('Found '+$('#portal .highlight').length);

         //       console.log(query);
         //    },500);
         // }
         // else{
         //     $('#portal').unhighlight();
         //     $('#search-count').text('');
         //     el.siblings('#search-clear').hide().siblings('.fa').show();
         //     $('#search-count').text('');
         // }

         if(query.length>0){
               $('#portal').unhighlight().highlight(query);

               el.siblings('.fa').hide().siblings('#search-clear').show();
               $('#search-count').text('Found '+$('#portal .highlight').length);
         }
         else{
             $('#portal').unhighlight();
             $('#search-count').text('');
             el.siblings('#search-clear').hide().siblings('.fa').show();
             $('#search-count').text('');
         }


      });

      //clear search
      $('#search-clear').click(function(){
         $('#search').val('').trigger('keyup');
      });

      function createPDF(){
         var success = function(status) {
            alert('Message: ' + status);
         };

         var error = function(status) {
            alert('Error: ' + status);
         };


         try{
            window.html2pdf.create(
               "<html><head></head><body><h1>Some</h1><p>html content.</p></body></html>",
               "~/Documents/output.pdf", // on iOS,
               // "test.pdf", on Android (will be stored in /mnt/sdcard/at.modalog.cordova.plugin.html2pdf/test.pdf)
               success,
               error
            );
         }
         catch(e){
            console.log('no cordova for pdf output');
         }
      }

      $('#export').click(function(){
         console.log('click');
         createPDF();
         return false;
      });
   }
   
});