// public/js/profile.js

let deletePostUrl = "";

// Function to open the confirmation modal
function openConfirmationModal(url) {
  deletePostUrl = url;
  document.getElementById('confirmationModal').classList.remove('hidden');
}

// Function to close the confirmation modal
function closeConfirmationModal() {
  document.getElementById('confirmationModal').classList.add('hidden');
}

// Event listener for the "Yes, Delete" button
document.addEventListener('DOMContentLoaded', function () {
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function () {
      fetch(deletePostUrl, { method: 'DELETE' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) location.reload();
          else alert('Error deleting post');
          closeConfirmationModal();
        });
    });
  }
});
