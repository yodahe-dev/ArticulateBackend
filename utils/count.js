const { PostLike, SavedPost } = require('../models');
const { Op } = require('sequelize');

const getPostStats = async (post_id) => {
  const likeCount = await PostLike.count({ where: { post_id } });
  const saveCount = await SavedPost.count({ where: { post_id } });

  return { likeCount, saveCount };
};

const getUserStats = async (user_id) => {
  const likedPosts = await PostLike.count({ where: { user_id } });
  const savedPosts = await SavedPost.count({ where: { user_id } });

  return { likedPosts, savedPosts };
};

module.exports = { getPostStats, getUserStats };
