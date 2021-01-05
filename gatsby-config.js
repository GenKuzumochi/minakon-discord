module.exports = {
  siteMetadata: {
    title: "Minakon Discord Experimental",
    description: "",
    social: {
      twitter: ""
    }
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
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./discord/`,
      },
    },
  ],
};
