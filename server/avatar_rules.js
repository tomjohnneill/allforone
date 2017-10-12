Slingshot.fileRestrictions("UsersAvatar", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/jpg"],
  maxSize: 2 * 1000 * 1000 // 2 MB (use null for unlimited)
});


Slingshot.createDirective("UsersAvatar", Slingshot.S3Storage, {
  bucket: "idle-photos", // change this to your s3's bucket name
  region: "eu-west-2",
  cacheControl: 'max-age=2592000',

  acl: "public-read",

  authorize: function (file, metaContext) {

    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file, metaContext) {
    // User's image url with ._id attached:
    console.log(metaContext.pledgeId + '/'  + file.name)
    return metaContext.pledgeId + '/'  + file.name;
  }
});

Slingshot.fileRestrictions("ThreadImage", {
  allowedFileTypes: null,
  maxSize: 2 * 1000 * 1000 // 2 MB (use null for unlimited)
});

Slingshot.fileRestrictions("UserPledgeUploads", {
  allowedFileTypes: null,
  maxSize: 2 * 1000 * 1000 // 2 MB (use null for unlimited)
});


Slingshot.createDirective("UserPledgeUploads", Slingshot.S3Storage, {
  bucket: "idle-photos", // change this to your s3's bucket name
  region: "eu-west-2",

  acl: "public-read",

  authorize: function (file, metaContext) {

    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file, metaContext) {
    // User's image url with ._id attached:
    console.log(metaContext.pledgeId + '/user_uploads/'  + file.name)
    return metaContext.pledgeId + '/user_uploads/'  + file.name;
  }
});

Slingshot.fileRestrictions("ThreadImage", {
  allowedFileTypes: null,
  maxSize: 2 * 1000 * 1000 // 2 MB (use null for unlimited)
});

Slingshot.createDirective("ThreadImage", Slingshot.S3Storage, {
  bucket: "idle-photos", // change this to your s3's bucket name
  region: "eu-west-2",

  acl: "public-read",

  authorize: function (file, metaContext) {

    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file, metaContext) {
    // User's image url with ._id attached:
    console.log('threads' + '/' + metaContext.threadId + '/'  + file.name)
    return 'threads' + '/' + metaContext.threadId + '/'  + file.name;
  }
});

Slingshot.fileRestrictions("messagePicture", {
  allowedFileTypes: null,
  maxSize: 2 * 1000 * 1000 // 2 MB (use null for unlimited)
});

Slingshot.createDirective("messagePicture", Slingshot.S3Storage, {
  bucket: "idle-photos", // change this to your s3's bucket name
  region: "eu-west-2",

  acl: "public-read",

  authorize: function (file, metaContext) {

    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file, metaContext) {
    // User's image url with ._id attached:
    console.log('messages' + '/' + metaContext.messageId + '/'  + file.name)
    return 'messages' + '/' + metaContext.messageId + '/'  + file.name;
  }
});
