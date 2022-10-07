const axios = require('axios');
const token = process.env.CANVAS_ACCESS_TOKEN;

const opts = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}

async function getGroupCategories(courseId) {
  const groupCategoryUrl = `https://k-state.test.instructure.com/api/v1/courses/${courseId}/group_categories`;
  const response = await axios.get(groupCategoryUrl, opts);
  const groupCategories = response.data;
  return groupCategories;
}

async function getGroupsInGroupCategory(groupCategoryId) {
  const groupCategoryUrl = `https://k-state.test.instructure.com/api/v1/group_categories/${groupCategoryId}/groups`;
  const response = await axios.get(groupCategoryUrl, opts);
  var groups = response.data;
  for(var group of groups) {
    const groupMembershipUrl = `https://k-state.test.instructure.com/api/v1/groups/${group.id}/users`;
    const response = await axios.get(groupMembershipUrl, opts);
    group.users = response.data;
  }
  return groups;
}


async function run() {
  var course
  var caturl = 'https://k-state.test.instructure.com/api/v1/courses/128649/group_categories';
  var groupurl = 'https://k-state.test.instructure.com/api/v1/group_categories/22399/groups';
  var memberurl = 'https://k-state.test.instructure.com/api/v1/groups/112833/users';
  var response = await axios.get(memberurl, opts);
  var groupCategories = response.data;
  console.log(response.data);
  
}

module.exports = {getGroupCategories, getGroupsInGroupCategory};