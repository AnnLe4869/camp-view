const Campground = require("./models/campground");
const Comment = require("./models/comment");

const data = [
  {
    name: "Cloud's Rest",
    image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
    description:
      "Maecenas id urna lectus. Maecenas lacinia massa non malesuada posuere. Phasellus feugiat pellentesque turpis, ut molestie risus mollis vel. Donec nec facilisis sem, nec bibendum quam. Fusce quam lacus, tincidunt vel convallis posuere, aliquam ut ipsum. Cras tellus arcu, condimentum et nisi nec, pretium faucibus nibh. Integer semper sodales diam. Fusce ut faucibus quam, nec rhoncus velit. Integer laoreet purus pretium neque venenatis cursus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam lacus neque, ullamcorper in sagittis porta, tempus et leo. Vestibulum ut libero non enim semper pretium in vitae tortor."
  },
  {
    name: "Desert Mesa",
    image:
      "https://i.pximg.net/img-original/img/2019/12/03/00/08/11/78112294_p0.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras malesuada elit non posuere blandit. Etiam a nulla lectus. Nullam quis metus vel massa imperdiet mattis. Etiam commodo libero vitae blandit commodo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec et eleifend nisl. Nullam risus odio, molestie sit amet feugiat eget, mattis non libero. Aenean at erat nec magna feugiat porta quis at dolor. Integer hendrerit nisi ac odio mattis ultricies. Aenean iaculis orci non felis vehicula, vitae egestas urna mollis. Nullam faucibus neque nisi, sed dapibus risus luctus id. Quisque tincidunt tempus dui suscipit fringilla. Curabitur accumsan porta ante, non vestibulum purus venenatis ut. Mauris a lacinia nisl. Duis quis ipsum at turpis finibus fermentum non ac magna. Cras in fringilla enim."
  },
  {
    name: "Canyon Floor",
    image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras malesuada elit non posuere blandit. Etiam a nulla lectus. Nullam quis metus vel massa imperdiet mattis. Etiam commodo libero vitae blandit commodo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec et eleifend nisl. Nullam risus odio, molestie sit amet feugiat eget, mattis non libero. Aenean at erat nec magna feugiat porta quis at dolor. Integer hendrerit nisi ac odio mattis ultricies. Aenean iaculis orci non felis vehicula, vitae egestas urna mollis. Nullam faucibus neque nisi, sed dapibus risus luctus id. Quisque tincidunt tempus dui suscipit fringilla. Curabitur accumsan porta ante, non vestibulum purus venenatis ut. Mauris a lacinia nisl. Duis quis ipsum at turpis finibus fermentum non ac magna. Cras in fringilla enim."
  },
  {
    name: "Silent night",
    image:
      "https://i.pximg.net/img-original/img/2019/07/30/00/00/04/75976892_p0.png",
    description:
      "Sed maximus ante tortor, ac pretium tortor ornare quis. Curabitur ultrices ultrices felis, ut aliquam quam dapibus a. Curabitur ut dolor ut mauris accumsan hendrerit quis quis diam. Vivamus vel ligula sit amet ex congue hendrerit. Ut pellentesque tempus erat. Nulla sit amet viverra nibh. Praesent sed diam ac sapien pharetra bibendum eget ut lacus. Ut imperdiet venenatis risus, eu consectetur mi molestie sit amet. Pellentesque accumsan dignissim orci, eget mattis ante mollis sed. Fusce laoreet elementum felis eget egestas. Aenean feugiat faucibus auctor.s"
  }
];

module.exports = async () => {
  try {
    await Campground.deleteMany({});
    await Comment.deleteMany({});
    // console.log("Success deleteMany all campground and comment");
    // for (const seed of data) {
    //   const campground = await Campground.create(seed);
    //   const comment = await Comment.create({
    //     text: "This place is great, but I wish there was internet",
    //     author: "Homer"
    //   });
    //   campground.comments.push(comment);
    //   await campground.save();
    //   console.log("Create new campground with comments");
    // }
  } catch (err) {
    console.error(err);
  }
};
