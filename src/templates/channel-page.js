import React, { useState } from "react"
import { Link, graphql } from "gatsby"

// import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import id2pc from "../id2pc.json"

import "./channel-page.sass"
import dayjs from "dayjs"
import { last, debounce } from "lodash"

function preprocessMessages(msgs) {
  const all = [];
  let talk = [];
  let talker = new Set();
  let pTalker = new Set();
  let lastmsg = null;
  let lastdiv = null;

  for (const m of msgs) {
    m.timestamp = dayjs(m.timestamp);
    const name = id2pc[m.author.id] || m.author.id;
    talker.add(name);
    const first = name.replace(/・.*?$/, "")
    m.content = m.content.replace("＠", "@")
    if ((lastmsg && lastmsg.timestamp.diff(m.timestamp, "hour", true) < -1) || m.content.startsWith("====")) {
      if (lastdiv && lastdiv.msg.length > 0) talk.push(lastdiv);
      lastdiv = {
        author: m.author.id,
        timestamp: m.timestamp,
        name: name,
        first: first,
        id: m.id,
        msg: []
      };
      if (talk.length > 0) all.push({
        talks: talk,
        allTalker: Array.from(talker),
        pcTalker: Array.from(pTalker),
      });
      talk = [];
      talker = new Set();
      pTalker = new Set();

      if (m.content.startsWith("====")) continue;

    }
    if (!lastmsg || lastmsg.author.id !== m.author.id) {
      if (lastdiv && lastdiv.msg.length > 0) talk.push(lastdiv);
      lastdiv = {
        author: m.author.id,
        timestamp: m.timestamp,
        name: name,
        first: first,
        id: m.id,
        msg: []
      };
    }
    if (m.mentions.length >= 2)
      m.content = "ERROR";
    else if (m.mentions.length === 1)
      m.content = m.content.replace(m.mentions[0].name, id2pc[m.mentions[0].id])
    for (const l of m.content.split("\n")) {
      if (!l.startsWith("@")) pTalker.add(name);
      lastdiv.msg.push(l)
    }
    lastmsg = m;
  }
  if (lastdiv && lastdiv.msg.length > 0) talk.push(lastdiv);
  if (talk.length > 0) all.push({
    talks: talk,
    allTalker: Array.from(talker),
    pcTalker: Array.from(pTalker),
  });
  return all;
}

function renderMessages(msgs, imgs, channel) {
  const ms = preprocessMessages(msgs);
  const talk = []
  for (const mlist of ms) {
    talk.push(<div className={"talk-block " + mlist.pcTalker.join(" ")}>
      <div className="talk-block-header" id={mlist.talks[0].timestamp.format("YYYYMMDD-hhmm")}>
        <Link to={`#${mlist.talks[0].timestamp.format("YYYYMMDD-hhmm")}`} className="anchor">
          {mlist.talks[0].timestamp.format("YYYY/MM/DD hh:mm")}〜{last(mlist.talks).timestamp.format("YYYY/MM/DD hh:mm")}
        </Link>
        {
          mlist.pcTalker.map(p => <Link className="pc-img-link" to={`https://mk.kuzumochi.work/pc/${p}`} >
            {imgs[p]?.childImageSharp ? <img src={imgs[p].childImageSharp.fixed.src} className="pc-img" alt={p} /> : ""}
            {p}
          </Link>)
        }
      </div>
      {
        mlist.talks.map(m => {
          const allat = m.msg.every(x => x.startsWith("@") || x.startsWith("＠"))
          return <div className={(allat ? "allat" : "normal-talk") + (m.msg.length === 1 ? " oneline" : "")}>
            <Link class="pc-img-link" to={`https://mk.kuzumochi.work/pc/${m.name}`} alt={m.name}>
              {
                imgs[m.name]?.childImageSharp ?
                  <img src={imgs[m.name].childImageSharp.fixed.src} className="pc-img" alt={m.name} /> :
                  <div className="pc-img-alt">{m.first}</div>
              }
            </Link>
            <h3>{m.name} <Link to={`https://discord.com/channels/779354026298179604/${channel.id}/${m.id}`}>{m.timestamp.format("YYYY/MM/DD hh:mm")}</Link></h3>
            <div>
              {
                m.msg.map(x => <div className={x.startsWith("@") ? "at" : "normal"}>{x}</div>)
              }
            </div>
          </div >
        })
      }
    </div>
    )
  }
  return talk
  // const res = [];
  // let last = null;
  // for (const m of msgs) {
  //   const name = id2pc[m.author.id];
  //   if (!last || last.author.id !== m.author.id) {
  //     if (m.author.id === "209048672195969025") res.push(<h3 className="sidekick">Siekick</h3>)
  //     res.push(<h3 className={name}><GatsbyImage resolutions={imgs[name]?.childImageSharp.fixed} />{name || m.author.id}</h3>);
  //   }
  //   if (m.content.startsWith("@") | m.content.startsWith("＠")) {
  //     if (m.mentions.length >= 2)
  //       res.push("ERROR");
  //     else if (m.mentions.length === 1)
  //       res.push(<div>{m.content.replace(m.mentions[0].name, id2pc[m.mentions[0].id])}</div>)
  //     else
  //       res.push(<div className="at">{m.content}</div>)
  //   } else {
  //     res.push(<div>{m.content}</div>)
  //   }
  //   last = m;
  // }
  // return res;
}


const Style = () => {
  const [filterText, setFilterText] = useState("");
  const [filter, setFilter] = useState("");
  const setFilter2 = debounce(e => setFilter(e), 1000)
  const handleFilter = e => {
    setFilterText(e.target.value)
    setFilter2(e.target.value)
  }
  return <><input value={filterText} onChange={handleFilter} placeholder="PC名で絞り込み" />
    <style>
      {filter === "" ?
        `
      .talk-block{
        display: block!important;
      }
    ` : `
      .talk-block${ filter.split(" ").map( x => `[class*='${x}']`).join("") } {
        display: block;
      }
    `}
    </style></>
}

const DiscordChannelTemplate = ({ data, location }) => {
  function createimageDict(images) {
    const list = {};
    for (const i of images) {
      list[i.node.fields["fullname"]] = i.node
    }
    return list;
  }
  const { channel, messages } = data.allDiscordJson.edges[0].node;
  const images = createimageDict(data.allFile.edges);
  const siteTitle = data.site.siteMetadata?.title || `Title`


  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={channel.name}
        description={channel.name}
      />
      <h1>{channel.name} <Style /></h1>
      <article className="blog-post">
        {renderMessages(messages, images, channel)}
      </article>
    </Layout>
  )
}

export default DiscordChannelTemplate

export const pageQuery = graphql`
query DiscordChannelQuery($channel: String!) {
  site {
    siteMetadata {
      title
    }
  }
  allFile(filter: {fields: {type: {eq: "pc"}}}) {
    edges {
      node {
        childImageSharp {
          fixed(width: 48, height: 48 , cropFocus: NORTH) {
            src
          }
        }
        id
        fields {
          link
          fullname
        }
      }
    }
  }
  allDiscordJson(filter: {channel: {id: {eq: $channel}}}) {
    edges {
      node {
        messages {
          author {
            id
            name
          }
          mentions {
            name
            id
          }
          timestamp
          content
          id
        }
        channel {
          id
          name
        }
      }
    }
  }
}
`
