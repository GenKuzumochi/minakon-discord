module.exports = {
  siteMetadata: {
    title: "Minakon Discord Experimental",
  },
  plugins: [
    "gatsby-plugin-sass",
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-92536246-3",
      },
    },
    "gatsby-plugin-react-helmet",
  ],
};
