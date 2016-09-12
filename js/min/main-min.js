function truncateTo(t,e){return t.length>e&&(t=t.substr(0,e),t+="..."),t}var db=openDatabase("traineeDB","1.0","Trainee DB",2097152),msg,topics,currentTopic="",prefix="NAVYTG",bookmarks;$.fn.animateOut=function(t,e){var i="webkitAnimationEnd";return t=t?t:"fadeOut",this.one(i,function(){$(this).hide(),$(this).removeClass(t+" animated"),e&&e.call(this)}),this.addClass("animated "+t),this},$.fn.animateIn=function(t,e){var i="webkitAnimationEnd";return t=t?t:"fadeIn",this.one(i,function(){$(this).removeClass(t+" animated"),e&&e.call(this)}),this.addClass("animated "+t).show(),this},$.fn.cascadeOut=function(t,e){var i=this.length-1,o=200;return this.each(function(a){var n=$(this);setTimeout(function(){e&&a===i?n.animateOut(t,e):n.animateOut(t)},o),o+=150}),this},$.fn.cascadeIn=function(t,e){var i=this.length-1,o=200;return this.each(function(a){var n=$(this);setTimeout(function(){e&&a===i?n.animateIn(t,e):n.animateIn(t)},o),o+=150}),this},$.extend($.expr[":"],{containsIN:function(t,e,i,o){return(t.textContent||t.innerText||"").toLowerCase().indexOf((i[3]||"").toLowerCase())>=0}}),$(document).ready(function(){function t(){$(".all-notes").empty(),db.transaction(function(t){t.executeSql("SELECT * FROM NOTES",[],function(t,e){var i=e.rows.length,o;for(msg="Found rows: "+i,1===i?$("#notes-counter").text(i+" note"):$("#notes-counter").text(i+" notes"),o=0;i>o;o++){msg=e.rows.item(o).title;var a='<a href="#" data-id="'+e.rows.item(o).ID+'" data-modified="'+e.rows.item(o).modified+'" class="note-link"><div class="note"><small class="date note-modified">'+e.rows.item(o).modified+"</small><h4>"+truncateTo(e.rows.item(o).title,40)+"</h4><p>"+truncateTo(e.rows.item(o).note,120)+"</p></div></a>";$(".all-notes").append($(a))}},null)})}function e(){function e(){$("[data-save]").each(function(){localStorage.setItem(prefix+"/"+currentTopic+"-"+$(this).attr("data-save"),$(this).val())})}function i(){$("[data-save]").each(function(){$(this).val(localStorage.getItem(prefix+"/"+currentTopic+"-"+$(this).attr("data-save")))})}function o(){$("#sectionNav").empty(),$("#portal [data-sectionTitle]").each(function(){var t='<li><a href="#" data-sectionTarget="'+$(this).attr("data-sectionTitle")+'"">'+$(this).attr("data-sectionTitle")+"</a></li>";$(t).appendTo("#sectionNav")}),$("#portal [data-sectionTitle]").length<=1?$(".sectionNav-button").hide():$(".sectionNav-button").show()}function a(){$.each(topics,function(t){var e='<li><a href="'+t+'" class="" data-topic="'+this.id+'">'+this.title+"</a></li>";$(e).appendTo("#topicNav")}),c()}function n(t){currentTopic=t.id,$("#portal").load(t.location,function(){$("#topic-title").text(t.title),$(".hero").css("background-image","url('"+t.image+"')"),$('#portal [data-toggle="tooltip"]').tooltip(),$('#portal .tooltip-show[data-toggle="tooltip"]').tooltip("show"),i(),l(),o(),$(window).scrollTop(0)})}function s(){var t=$("#portal").clone();t.text($("#topic-title").text()+"\n"+t.text()),t.find("input").each(function(){$(this).hasClass("inline-form")?$(this).replaceWith("[ANSWER: "+$(this).val()+"]]]"):$(this).replaceWith("[ANSWER: "+$(this).val()+"]")});var e=t.text(),i=e.replace(/^[ \t\r]+\b/gm,"");e=i,i=e.replace(/^\s*?(?=\[)/gm,"\n"),e=i,i=e.replace(/\]\]\]\n/gm,"] "),e=i,i=e.replace(/^\s+$/gm,"\n"),e=i,i=e.replace(/^\n+/gm,"\n"),$(".exportContainer").html(i)}function c(){$("#topicNav-search").val(""),$("#topicNav li").show().removeClass("even"),$("#topicNav li:even").addClass("even"),$(".topicNav-bookmarks-btn").removeClass("filter-selected"),$("#topicNav-search").removeAttr("disabled")}function l(){-1==bookmarks.indexOf(currentTopic)?$(".bookmark-toggle-btn").removeClass("bookmarked"):$(".bookmark-toggle-btn").addClass("bookmarked"),$("#topicNav li a").each(function(){-1==bookmarks.indexOf($(this).attr("data-topic"))?$(this).removeClass("bookmarked"):$(this).addClass("bookmarked")})}t(),$("#new-note-button").click(function(){var t=new Date;$("#new-note-title").val($("#topic-title").text())}),$(".save-note-button").click(function(){var e=$("#new-note-title").val(),i=$("#new-note-note").val(),o=new Date;db.transaction(function(a){a.executeSql("INSERT INTO NOTES (title, note, modified) VALUES (?,?,?)",[e,i,o.getMonth()+1+"/"+o.getDate()+"/"+o.getFullYear()],t)})}),$("#new-note, #edit-note").on("hidden.bs.modal",function(){$("#new-note .modal-input").val("")}),$(".all-notes").on("click","a",function(){var t=$(this).attr("data-id");db.transaction(function(e){e.executeSql("SELECT * FROM NOTES WHERE ID=?",[t],function(t,e){$("#edit-note-title").val(e.rows.item(0).title),$("#edit-note-note").val(e.rows.item(0).note),$(".edit-save-note-button").data("ID",e.rows.item(0).ID),$(".edit-delete-note-button").data("ID",e.rows.item(0).ID),$("#edit-note").modal()},null)})}),$(".edit-delete-note-button").click(function(){var e=$(this).data("ID");db.transaction(function(i){i.executeSql("DELETE FROM NOTES WHERE ID=?",[e],function(){t()})})}),$(".edit-save-note-button").click(function(){var e=$("#edit-note-title").val(),i=$("#edit-note-note").val(),o=$(this).data("ID");db.transaction(function(a){a.executeSql("UPDATE NOTES SET title=?, note=? WHERE ID=?",[e,i,o],t)})}),i(),$("#portal").on("keyup","[data-save]",function(){e()}),n(topics[0]),a(),$("#topicNav").on("click","a",function(){return n(topics[$(this).attr("href")]),$(this).addClass("selected").parent().siblings().children().removeClass("selected"),$(".topicNav-wrapper,.shroud").hide(),c(),!1}),$("#sectionNav").on("click","a",function(){var t=$(this);return $(window).scrollTop($('[data-sectionTitle="'+t.attr("data-sectionTarget")+'"]').offset().top-70),$("#sectionNav,.shroud").hide(),!1}),$(".sectionNav-button").click(function(){return $("#sectionNav, .shroud").toggle(),!1}),$(".topicNav-button").click(function(){return $(".topicNav-wrapper, .shroud").toggle(),!1}),$(window).click(function(){$("#sectionNav, .topicNav-wrapper").hide(),$(".shroud").hide(),c()}),$("#search").keyup(function(){var t=$(this).val(),e=$(this);t.length>0?($("#portal").unhighlight().highlight(t),e.siblings(".fa").hide().siblings("#search-clear").show(),$("#search-count").text("Found "+$("#portal .highlight").length)):($("#portal").unhighlight(),$("#search-count").text(""),e.siblings("#search-clear").hide().siblings(".fa").show(),$("#search-count").text(""))}),$("#search-clear").click(function(){$("#search").val("").trigger("keyup")}),$("#export").click(function(){s()}),$(".copy-button").click(function(){return $(".exportContainer")[0].focus(),$(".exportContainer")[0].setSelectionRange(0,9999999),!1}),$("#topicNav-search").keyup(function(){""!=$("#topicNav-search").val()?($("#topicNav li").hide(),$('#topicNav li a:containsIN("'+$(this).val()+'")').parent().show(),$("#topicNav-search-clear").show().siblings(".fa").hide(),$("#topicNav li:visible:even").addClass("even"),$("#topicNav li:visible:odd").removeClass("even")):($("#topicNav li").show(),$("#topicNav-search-clear").hide().siblings(".fa").show(),c())}),$(".topicNav-search-wrapper").click(function(t){var e=$(t.target);e.is("#topicNav-search-clear")&&(c(),$("#topicNav-search-clear").hide().siblings(".fa").show()),t.stopPropagation()}),$(".bookmark-toggle-btn").click(function(){return $(this).hasClass("bookmarked")?bookmarks.splice(bookmarks.indexOf(currentTopic),1):bookmarks.push(currentTopic),l(),localStorage.setItem("navyTG-bookmarks",JSON.stringify(bookmarks)),!1}),$(".topicNav-bookmarks-btn").click(function(){return $(this).toggleClass("filter-selected"),$(this).hasClass("filter-selected")?($("#topicNav-search").attr("disabled","disabled"),$("#topicNav li").hide(),$("#topicNav li a.bookmarked").parent().show()):($("#topicNav-search").removeAttr("disabled"),$("#topicNav li").show()),!1})}FastClick.attach(document.body),bookmarks=localStorage.getItem("navyTG-bookmarks")?JSON.parse(localStorage.getItem("navyTG-bookmarks")):[],db.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS NOTES (ID INTEGER PRIMARY KEY ASC, title, note, modified DATETIME)")}),$.getJSON("topics.json",function(t){topics=t,e()}),$.getJSON("help.json",function(t){$.each(t,function(){var t='<div class="help-item"><div class="help-question">'+this.question+'</div><div class="help-answer">'+this.answer+"</div></div>";$(t).appendTo(".help-items")}),$(".help-question").click(function(){$(this).toggleClass("open").siblings(".help-answer").toggle()}),$(".help-search").keyup(function(){""!=$(".help-search").val()?($(".help-item").hide(),$('.help-question:containsIN("'+$(".help-search").val()+'")').parent().show()):$(".help-item").show()})})}),$(window).scroll(function(){var t=$(window).scrollTop();t>270?$(".utility").addClass("scroll-sticky"):$(".utility").removeClass("scroll-sticky")});