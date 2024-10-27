function showMessages() {
    const container = document.querySelector('.threads-container');
    container.style.display = 'block';
    const button = document.querySelector('.show-messages-btn');
    button.style.display = 'none';
}

function toggleInput(icon) {
    const form = icon.closest('form');
    const input = form.querySelector('input[type="text"]');
    const submit = form.querySelector('input[type="submit"]');
    input.classList.toggle('hidden');
    submit.classList.toggle('hidden');
}

function toggleReplies(button) {
    const repliesContainer = button.nextElementSibling;
    if (repliesContainer.style.display === 'block') {
        repliesContainer.style.display = 'none';
        button.textContent = 'Show Replies';
    } else {
        repliesContainer.style.display = 'block';
        button.textContent = 'Hide Replies';
    }
}



// const usermail=document.querySelector('.useremail')
//     usermail.addEventListener('click',function(){
//         console.log('email is clicked')
//     })


document.addEventListener('DOMContentLoaded', function() {
    const infoIdButtons = document.querySelectorAll('.infoid-btn');
    
    infoIdButtons.forEach(button => {
        button.addEventListener('click', function() {
            const queryId = button.getAttribute('data-query-id');

            fetch('/log-query-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ queryId: queryId })
            })
            .then(response => response.json())
            .then(data => {
                const summaryElement = document.createElement('p');
                summaryElement.innerHTML = `<strong>Summary:</strong> ${data.summary}`;
                button.insertAdjacentElement('afterend', summaryElement);
            })
            .catch(error => {
                console.error('Error sending query ID:', error);
            });
        });
    });

    // Function to check for flagged replies and update the UI
    const flagReplyButtons = document.querySelectorAll('.flag-reply-btn');
    
    flagReplyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const threadElement = button.closest('.thread');
            const replies = threadElement.querySelectorAll('.reply');
            
            const repliesData = Array.from(replies).map(reply => ({
                replycontent: reply.querySelector('p').textContent,
                user: {
                    _id: reply.getAttribute('data-user-id')
                },
                _id: reply.getAttribute('data-reply-id')
            }));

            fetch('/flagged-replies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ replies: repliesData })
            })
            .then(response => response.json())
            .then(data => {
                const flaggedReplies = data.flaggedReplies;
                replies.forEach(reply => {
                    const replyId = reply.getAttribute('data-reply-id');
                    if (flaggedReplies.includes(replyId)) {
                        // Create a threat icon using Font Awesome and insert it before the reply content
                        const threatIcon = document.createElement('i');
                        threatIcon.className = 'fas fa-exclamation-triangle'; // Font Awesome icon class
                        threatIcon.style.color = 'red'; // Change icon color if needed
                        threatIcon.style.marginRight = '5px'; // Space between icon and text

                        const replyContent = reply.querySelector('p');
                        replyContent.insertBefore(threatIcon, replyContent.firstChild);

                        // Optionally, you can change text color or style
                        replyContent.style.color = 'red'; // Change text color
                    }
                });
            })
            .catch(error => {
                console.error('Error checking flagged replies:', error);
            });
        });
    });
});
