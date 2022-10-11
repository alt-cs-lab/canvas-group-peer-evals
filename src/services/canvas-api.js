const axios = require('axios');
const token = process.env.CANVAS_ACCESS_TOKEN;
const canvasHostname = process.env.CANVAS_HOST

const opts = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}

async function getGroupCategories(courseId) {
  const groupCategoryUrl = `https://${canvasHostname}/api/v1/courses/${courseId}/group_categories`;
  const response = await axios.get(groupCategoryUrl, opts);
  const groupCategories = response.data;
  return groupCategories;
}

async function getGroupsInGroupCategory(groupCategoryId) {
  const groupCategoryUrl = `https://${canvasHostname}/api/v1/group_categories/${groupCategoryId}/groups`;
  const response = await axios.get(groupCategoryUrl, opts);
  var groups = response.data;
  for(var group of groups) {
    const groupMembershipUrl = `https://${canvasHostname}/api/v1/groups/${group.id}/users`;
    const response = await axios.get(groupMembershipUrl, opts);
    group.users = response.data;
  }
  return groups;
}

module.exports = {getGroupCategories, getGroupsInGroupCategory};