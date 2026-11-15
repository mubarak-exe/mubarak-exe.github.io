/* Site content. Edit the text here; every page is built from this file.
   Inline links to other pages use href="#<page-id>" (for example #linketa). */
(function (g) {
  "use strict";
  const SITE = (g.SITE = g.SITE || {});

  SITE.person = {
    name: "Mubarak Shikalgar",
    email: "er.mubaraks@gmail.com",
    linkedin: "https://linkedin.com/in/mubaraks",
    linkedinLabel: "linkedin.com/in/mubaraks",
    github: "https://github.com/mubarak-exe",
    githubLabel: "github.com/mubarak-exe",
    location: "Waterloo, Ontario, Canada",
    coords: "43.46° N, 80.52° W",
    status: "Looking for machine learning and research roles in Canada."
  };

  SITE.stats = [
    { value: "23.7%", label: "lower ETA error than Baidu's DuETA, on average", view: "linketa" },
    { value: "8M+", label: "road-segment data points from my GPS pipeline", view: "linketa" },
    { value: "96.7%", label: "of unsupported requests caught by my agent's verifier", view: "text2simulation" },
    { value: "$54K", label: "CAD in graduate funding and studentship", view: "about" }
  ];

  SITE.toolkit = [
    "Graph Transformers", "Spatiotemporal prediction", "Meta-learning", "LLM agents", "LangGraph",
    "Map matching", "OpenStreetMap", "OR-Tools", "Mixed-Integer Programming", "PyTorch", "Digital twins", "Geospatial ETL"
  ];

  /* ------------------------------------------------------------------ */
  /* Projects                                                            */
  /* ------------------------------------------------------------------ */
  SITE.projects = [
    {
      id: "linketa",
      title: "LinkETA",
      titleLines: ["LinkETA"],
      type: "Research",
      tagline: "Graph ML",
      tags: ["ETA", "graph", "transformer", "meta-learning", "travel time", "GPS"],
      years: "2025–26",
      when: "June 2025 – Oct 2026",
      role: "Research Assistant",
      org: "SPIN Lab, Wilfrid Laurier University",
      tools: ["Python", "Graph Transformers", "Map matching", "OpenStreetMap", "MAML", "Reptile"],
      cover: "network",
      seed: 41,
      featured: true,
      hook: "A Graph Transformer that predicts travel time for every road segment, and adapts to a new city from 25 trips.",
      thesis: "Predict travel time for every road segment, not just whole trips, and make the model work in a new city with almost no data.",
      metric: { value: "23.7%", label: "lower error than Baidu's DuETA" },
      outcomes: [
        { value: "23.7%", label: "lower error than Baidu's DuETA, on average" },
        { value: "17.6%", label: "lower error than Uber's DeeprETA, on average" },
        { value: "14.2%", label: "lower road-segment error in new cities (up to)" },
        { value: "8M+", label: "road-segment data points from the ETL pipeline" }
      ],
      sections: [
        {
          id: "question", title: "Why one road at a time",
          blocks: [
            { t: "p", text: "An ETA model answers a simple question: how long will this trip take? Many models answer it for the whole route at once. That works for a single trip, but routing engines and dispatch systems need something finer. They compare many possible routes, and every route is built from the same road segments, or links." },
            { t: "p", text: "LinkETA predicts the travel time of each link instead. A route's ETA is the sum of its links, and the same link predictions can be reused by any route that passes through them." },
            { t: "quote", text: "Predict the road once, and every route that uses it can reuse the answer." }
          ]
        },
        {
          id: "data", title: "From GPS traces to 8 million road segments",
          blocks: [
            { t: "p", text: "Taxi GPS data is noisy. Points drift off the road, trips stop and start, and a raw trace doesn't say which road the car was on. Before any modelling, I built a geospatial ETL pipeline that turns raw trips into clean travel times for each road segment." },
            { t: "flow", label: "Data pipeline", steps: [
              { title: "Collect", text: "Taxi GPS trips from cities in Europe, the Americas and Asia." },
              { title: "Screen", text: "Filter out trips and points that can't be trusted." },
              { title: "Map-match", text: "Snap each trace to the real road network from OpenStreetMap." },
              { title: "Aggregate", text: "Compute travel time and traffic features for every road segment." }
            ] },
            { t: "stats", items: [
              { value: "8M+", label: "road-segment data points" },
              { value: "3", label: "continents of taxi data" }
            ] }
          ]
        },
        {
          id: "model", title: "A Graph Transformer for the road network",
          blocks: [
            { t: "p", text: "A road network is a graph. Segments meet at intersections, and traffic on one segment spills into the segments around it. LinkETA is a multi-relational Graph Transformer: it models the network as a graph with more than one kind of relationship between segments, and lets each segment's prediction draw on its neighbours." },
            { t: "p", text: "Routing and dispatch systems call an ETA model constantly, so LinkETA was also designed for low-latency prediction." },
            { t: "demo", kind: "route", title: "Plan a trip, link by link", note: "Click any two intersections. The trip ETA is the sum of its road segments, and the list shows each segment's share. Move the clock to see rush hour build. <strong>This is an illustration on a synthetic network, not the LinkETA model.</strong>" }
          ]
        },
        {
          id: "transfer", title: "A new city with almost no data",
          blocks: [
            { t: "p", text: "A model trained in one city usually struggles in the next. Road layouts differ, driving patterns differ, and a new city may have very little trip data at the start." },
            { t: "p", text: "I developed a heuristic method built on Model-Agnostic Meta-Learning (MAML) and OpenAI's Reptile. Meta-learning trains a starting point that adapts quickly, so the model can fit a new city from a small sample. The idea is explained in more depth in the note <a href=\"#note-25-trips\">Twenty-five trips to learn a new city</a>." },
            { t: "stats", items: [
              { value: "25", label: "trips per new city" },
              { value: "14.2%", label: "lower road-segment error (up to)" },
              { value: "13×", label: "faster per trip" }
            ] }
          ]
        },
        {
          id: "results", title: "How it compares",
          blocks: [
            { t: "p", text: "LinkETA was compared with two ETA systems from industry, Baidu's DuETA and Uber's DeeprETA. On average, it had lower error than both." },
            { t: "bars", title: "Average error reduction with LinkETA", unit: "%", max: 30, ticks: [0, 10, 20, 30], items: [
              { label: "vs Baidu's DuETA", value: 23.7 },
              { label: "vs Uber's DeeprETA", value: 17.6 }
            ] }
          ]
        },
        {
          id: "next", title: "Where it went next",
          blocks: [
            { t: "p", text: "LinkETA became the travel-time engine inside DTUMOS, an open-source digital twin for urban mobility, and part of my master's thesis." },
            { t: "links", items: [
              { kicker: "Project", title: "DTUMOS digital twin", text: "LinkETA powers its traffic-aware ETAs.", view: "dtumos" },
              { kicker: "Preprint", title: "LinkETA: A Multi-Relational Graph Transformer for Link-Level Travel Time Estimation", text: "SSRN", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7379984" },
              { kicker: "Thesis", title: "Intelligent Digital Twin System for Urban Mobility", text: "Wilfrid Laurier University, 2026", href: "https://scholars.wlu.ca/etd/2908/" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "ETA", def: "Estimated time of arrival: the predicted travel time for a trip." },
        { term: "Link", def: "One road segment between two intersections." },
        { term: "Map matching", def: "Snapping noisy GPS points onto the roads a vehicle actually drove." },
        { term: "Graph Transformer", def: "A neural network that applies attention over a graph, so each node can weigh information from the nodes around it." },
        { term: "MAML", def: "Model-Agnostic Meta-Learning. Trains model weights that adapt to a new task in a few steps." },
        { term: "Reptile", def: "A simpler meta-learning method from OpenAI with the same goal as MAML and lower computational cost." }
      ],
      related: ["dtumos", "text2simulation", "dementia-review"]
    },

    {
      id: "text2simulation",
      title: "Text2Simulation",
      titleLines: ["Text2", "Simulation"],
      type: "Systems",
      tagline: "LLM agent",
      tags: ["LLM", "agent", "GPT-4o", "LangGraph", "verification", "natural language"],
      years: "2026",
      when: "Feb – April 2026",
      role: "Research Assistant",
      org: "SPIN Lab, Wilfrid Laurier University",
      tools: ["GPT-4o", "LangGraph", "Python", "DTUMOS"],
      cover: "agent",
      seed: 7,
      featured: true,
      hook: "Describe a traffic scenario in plain language. An LLM agent sets it up in the digital twin, after checking it can actually run.",
      thesis: "A natural-language interface for a transportation digital twin, with a verifier that stops requests the simulator can't support.",
      metric: { value: "96.7%", label: "of unsupported requests caught" },
      outcomes: [
        { value: "96.7%", label: "of unsupported requests caught" },
        { value: "0", label: "false alarms" },
        { value: "0", label: "extra LLM calls for verification" }
      ],
      sections: [
        {
          id: "problem", title: "Powerful, but hard to set up",
          blocks: [
            { t: "p", text: "<a href=\"#dtumos\">DTUMOS</a> can simulate a lot, but setting up a scenario means knowing its configuration options. That limits who can use it. A natural-language interface removes the barrier: describe the scenario and let an agent write the configuration." }
          ]
        },
        {
          id: "risk", title: "Language models say yes too easily",
          blocks: [
            { t: "p", text: "The risk is that a language model will accept almost any request. Ask for something the digital twin doesn't model, and the model may still return a confident configuration." },
            { t: "quote", text: "A configuration that looks valid is not the same as one the simulator can run." }
          ]
        },
        {
          id: "agent", title: "How the agent works",
          blocks: [
            { t: "p", text: "The agent is built with GPT-4o and LangGraph. It reads the request, builds a DTUMOS configuration, and runs the simulation." },
            { t: "flow", label: "Agent flow", steps: [
              { title: "Request", text: "A scenario described in plain language." },
              { title: "Agent", text: "GPT-4o and LangGraph turn it into a DTUMOS configuration." },
              { title: "Verify", text: "The configuration is checked against what the digital twin supports." },
              { title: "Run or refuse", text: "Supported requests run. Unsupported ones are stopped with a reason." }
            ] }
          ]
        },
        {
          id: "verification", title: "Check before you run",
          blocks: [
            { t: "p", text: "Between the configuration and the run sits a verification module. It validates each configuration against the digital twin's capabilities, so an unsupported request is caught before the simulation starts." },
            { t: "p", text: "The check makes no extra LLM calls, so it adds no model cost." },
            { t: "demo", kind: "checker", title: "Try the verifier", note: "<strong>Toy version for this page.</strong> It reads a request with simple rules and checks it against a short, simplified capability list. The real system uses GPT-4o and LangGraph, and checks against DTUMOS's actual capabilities." }
          ]
        },
        {
          id: "results", title: "Results",
          blocks: [
            { t: "p", text: "The verification module caught 96.7% of unsupported requests with zero false alarms, so it never blocked a request the system could run." },
            { t: "stats", items: [
              { value: "96.7%", label: "of unsupported requests caught" },
              { value: "0", label: "false alarms" },
              { value: "0", label: "extra LLM calls" }
            ] },
            { t: "links", items: [
              { kicker: "Paper · IEEE Xplore", title: "Text2Simulation: A Natural Language Interface for Transportation Digital Twin Systems" },
              { kicker: "Note", title: "Teaching an LLM agent to say no", text: "Why the verifier matters more than the parser.", view: "note-say-no" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "LLM agent", def: "A program that uses a large language model to plan steps and call tools, not just to answer text." },
        { term: "LangGraph", def: "A framework for building LLM agents as graphs of steps with explicit control flow." },
        { term: "GPT-4o", def: "OpenAI's multimodal large language model, used here to interpret requests." },
        { term: "False alarm", def: "A supported request that the verifier wrongly blocks." }
      ],
      related: ["dtumos", "linketa", "dementia-review"]
    },

    {
      id: "dtumos",
      title: "DTUMOS",
      titleLines: ["DTUMOS"],
      type: "Systems",
      tagline: "Digital twin",
      tags: ["digital twin", "simulation", "dispatch", "MIP", "OR-Tools", "open source", "taxi"],
      years: "2025–now",
      when: "April 2025 – present",
      role: "Contributor",
      org: "SPIN Lab, with CAMUS Lab, Gachon University (South Korea)",
      tools: ["Python", "Mixed-Integer Programming", "Google OR-Tools", "LinkETA"],
      cover: "dispatch",
      seed: 13,
      featured: true,
      hook: "An open-source digital twin for urban mobility. I added traffic-aware ETAs and helped build its minute-by-minute taxi dispatch.",
      thesis: "A city you can test on: an open-source digital twin with traffic-aware travel times and a dispatch engine that scales to any fleet size.",
      metric: { value: "Any", label: "fleet size the dispatch simulation scales to" },
      outcomes: [
        { value: "1 min", label: "dispatch time step" },
        { value: "Any", label: "fleet size the simulation scales to" },
        { value: "MIP", label: "matching, solved with Google OR-Tools" }
      ],
      sections: [
        {
          id: "context", title: "A city you can test on",
          blocks: [
            { t: "p", text: "DTUMOS stands for Digital Twin for Urban Mobility Operating System. It is an open-source platform that simulates mobility services in a city, developed in partnership with CAMUS Lab at Gachon University in South Korea." },
            { t: "p", text: "For a taxi simulation, two parts matter most: how long trips take, and how taxis are matched to passengers. My work focused on both." }
          ]
        },
        {
          id: "dispatch", title: "Matching taxis to passengers, minute by minute",
          blocks: [
            { t: "p", text: "I helped develop a dispatch simulation that runs in one-minute steps. Each minute, new ride requests arrive, and the engine decides which available taxi should serve which passenger." },
            { t: "p", text: "The matching is solved as a Mixed-Integer Programming problem with Google's OR-Tools, and the simulation scales to any fleet size." },
            { t: "demo", kind: "dispatch", title: "Run a small dispatch simulation", note: "Change the fleet size and demand and watch waiting times respond. <strong>Simplified demo:</strong> it matches with a greedy nearest-taxi rule on a grid. The DTUMOS engine solves the matching with Mixed-Integer Programming." }
          ]
        },
        {
          id: "travel-time", title: "Traffic-aware ETAs from LinkETA",
          blocks: [
            { t: "p", text: "I integrated <a href=\"#linketa\">LinkETA</a> into DTUMOS so simulated trips use traffic-driven travel time predictions. This moves the platform toward an intelligent transportation system." },
            { t: "flow", label: "Simulation loop", steps: [
              { title: "Requests", text: "Ride requests arrive each simulated minute." },
              { title: "Dispatch", text: "Taxis are matched to passengers with MIP in OR-Tools." },
              { title: "Travel time", text: "LinkETA predicts how long each trip will take in current traffic." },
              { title: "City state", text: "Taxis move, passengers are served, and the next minute begins." }
            ] }
          ]
        },
        {
          id: "next", title: "Built on top",
          blocks: [
            { t: "p", text: "With the simulation in place, the next question was who can use it. Text2Simulation adds a natural-language interface, so a scenario can be described in plain words instead of configured by hand." },
            { t: "links", items: [
              { kicker: "Project", title: "Text2Simulation", text: "An LLM agent that configures DTUMOS from plain language.", view: "text2simulation" },
              { kicker: "Thesis", title: "Intelligent Digital Twin System for Urban Mobility", text: "Wilfrid Laurier University, 2026", href: "https://scholars.wlu.ca/etd/2908/" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "Digital twin", def: "A software model of a real system, used to test changes before making them in the real world." },
        { term: "Dispatch", def: "Deciding which vehicle serves which ride request." },
        { term: "Mixed-Integer Programming", def: "An optimization method where some decisions must be whole numbers, such as assigning a taxi (1) or not (0)." },
        { term: "OR-Tools", def: "Google's open-source library for optimization problems such as routing and assignment." }
      ],
      related: ["linketa", "text2simulation", "glazingshopee"]
    },

    {
      id: "glazingshopee",
      title: "Glass façade products",
      titleLines: ["Glass façade", "products"],
      type: "Product",
      tagline: "Web products",
      tags: ["product", "web", "Agile", "IGU", "quotation", "FacadeMart", "Buyglass24", "EdFacade"],
      years: "2022–24",
      when: "June 2022 – June 2024",
      role: "IT Consultant",
      org: "Glazingshopee, Mumbai",
      tools: ["Agile sprint planning", "SRS and FRS", "Use case diagrams", "Test cases"],
      cover: "facade",
      seed: 3,
      featured: true,
      hook: "FacadeMart, Buyglass24 and EdFacade: web products that took glass façade quotations from weeks to minutes.",
      thesis: "Three web products that turned a fragmented, weeks-long quotation process into one workflow that takes minutes.",
      metric: { value: "Weeks → minutes", label: "quotation time" },
      outcomes: [
        { value: "Weeks → minutes", label: "quotation generation time" },
        { value: "5", label: "people on the cross-functional team" },
        { value: "3", label: "products: FacadeMart, Buyglass24, EdFacade" }
      ],
      sections: [
        {
          id: "problem", title: "Quotes that took weeks",
          blocks: [
            { t: "p", text: "Glass façades are built from Insulated Glass Units (IGUs), and every project needs its own sizes, glass types and quantities. Producing a quotation took weeks, because the work was spread across a fragmented, multi-step process." }
          ]
        },
        {
          id: "product", title: "One workflow from configuration to delivery",
          blocks: [
            { t: "p", text: "I led end-to-end product development for three web applications: FacadeMart, Buyglass24 and EdFacade. Together they covered the whole path of an order." },
            { t: "flow", label: "Order workflow", steps: [
              { title: "Configure", text: "Specify the IGU: sizes, glass types and quantities." },
              { title: "Optimize cuts", text: "Plan how glass is cut to reduce waste." },
              { title: "Procure", text: "Source the materials for the order." },
              { title: "Deliver", text: "Manage delivery to the project." }
            ] }
          ]
        },
        {
          id: "team", title: "Running the team",
          blocks: [
            { t: "list", items: [
              "Coordinated a 5-person cross-functional team.",
              "Managed changing client requirements through Agile sprint planning.",
              "Wrote the key documentation: SRS, FRS, use case diagrams and test cases."
            ] }
          ]
        },
        {
          id: "result", title: "Weeks to minutes",
          blocks: [
            { t: "p", text: "Consolidating the process into one workflow cut quotation generation from weeks to minutes." },
            { t: "stats", items: [
              { value: "Weeks → minutes", label: "quotation generation time" },
              { value: "3", label: "products shipped" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "IGU", def: "Insulated Glass Unit: two or more glass panes sealed together with a gap between them, used in façades and windows." },
        { term: "Cut optimization", def: "Planning how to cut glass sheets so the required pieces use as little material as possible." },
        { term: "SRS and FRS", def: "Software and Functional Requirements Specifications: documents that define what a system must do." }
      ],
      related: ["dtumos", "linketa", "fake-news"]
    },

    {
      id: "dementia-review",
      title: "Affect recognition for dementia care",
      titleLines: ["Affect recognition", "for dementia care"],
      type: "Research",
      tagline: "Systematic review",
      tags: ["review", "affective computing", "robots", "dementia", "emotion", "datasets"],
      years: "2026",
      when: "July – Oct 2026",
      role: "Researcher",
      org: "SQUAD Lab, Wilfrid Laurier University",
      tools: ["Systematic review", "Multimodal affect recognition", "Socially assistive robots"],
      cover: "signals",
      seed: 29,
      featured: false,
      hook: "A systematic review of how socially assistive robots recognize emotion in people living with dementia, and why lab results don't transfer.",
      thesis: "How well can socially assistive robots recognize emotion in people living with dementia, and do lab results hold up in real care?",
      metric: { value: "31", label: "studies reviewed" },
      outcomes: [
        { value: "31", label: "studies reviewed" },
        { value: "4", label: "signal types: facial, speech, physiological, body movement" },
        { value: "31", label: "public emotion datasets catalogued" }
      ],
      sections: [
        {
          id: "question", title: "Can a robot read how someone feels?",
          blocks: [
            { t: "p", text: "Socially assistive robots are being studied as a support in dementia care. To respond well, a robot needs to recognize a person's emotional state. This review asked how well current methods do that, and whether the results hold up outside the lab." }
          ]
        },
        {
          id: "scope", title: "Four kinds of signal",
          blocks: [
            { t: "p", text: "I reviewed 31 studies of multimodal affect recognition across four kinds of signal." },
            { t: "cards", items: [
              { kicker: "Signal 1", title: "Facial", text: "Expressions captured from camera images." },
              { kicker: "Signal 2", title: "Speech", text: "Tone, pitch and the words people use." },
              { kicker: "Signal 3", title: "Physiological", text: "Body signals such as heart rate or skin conductance." },
              { kicker: "Signal 4", title: "Body movement", text: "Posture, gesture and activity." }
            ] }
          ]
        },
        {
          id: "finding", title: "Lab accuracy did not hold in real care",
          blocks: [
            { t: "p", text: "The main finding was a gap between settings: accuracy reported in lab conditions did not hold in real-world care." },
            { t: "callout", title: "Why it matters", text: "Results from controlled settings can overstate how well a system will work with real people. Testing in real care settings is the step that decides whether a method is ready." }
          ]
        },
        {
          id: "datasets", title: "A map of the data",
          blocks: [
            { t: "p", text: "I also catalogued 31 public emotion datasets used in dementia studies, so it is easier to see what data exists and where the gaps are." },
            { t: "links", items: [
              { kicker: "Note", title: "What lab accuracy doesn't tell you", text: "Notes from the review.", view: "note-lab-vs-care" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "Affect recognition", def: "Estimating a person's emotional state from signals such as the face, voice or body." },
        { term: "Multimodal", def: "Using more than one kind of signal at the same time." },
        { term: "Socially assistive robot", def: "A robot designed to help people through social interaction, such as conversation or companionship." },
        { term: "Systematic review", def: "A structured review that searches, screens and compares all relevant studies on a question using a defined method." }
      ],
      related: ["linketa", "text2simulation", "fake-news"]
    },

    {
      id: "fake-news",
      title: "Fake news detection",
      titleLines: ["Fake news", "detection"],
      type: "Research",
      tagline: "NLP",
      tags: ["NLP", "deep learning", "BiLSTM", "TCN", "attention", "undergraduate"],
      years: "2021–22",
      when: "2021–22",
      role: "B.Tech. final-year project",
      org: "Sanjay Ghodawat University, Kolhapur",
      tools: ["Deep learning", "BiLSTM", "TCN", "Attention mechanism"],
      cover: "attention",
      seed: 17,
      featured: false,
      hook: "My undergraduate project: a hybrid BiLSTM-TCN model with attention, recognised with the SGU Best Project Award.",
      thesis: "A hybrid deep learning model for detecting fake news, published in IEEE Xplore and recognised with the SGU Best Project Award.",
      metric: { value: "Best Project", label: "SGU award, 2021–22" },
      outcomes: [
        { value: "Best Project", label: "SGU Best Project Award, 2021–22" },
        { value: "2023", label: "published in IEEE Xplore" }
      ],
      sections: [
        {
          id: "project", title: "The project",
          blocks: [
            { t: "p", text: "For my B.Tech. final-year project at Sanjay Ghodawat University, I worked on detecting fake news with deep learning." }
          ]
        },
        {
          id: "model", title: "A hybrid model",
          blocks: [
            { t: "p", text: "The model combines a bidirectional LSTM (BiLSTM), which reads text in both directions, with a Temporal Convolutional Network (TCN), and adds an attention mechanism that weighs the most informative parts of the input." },
            { t: "flow", label: "Model", steps: [
              { title: "BiLSTM", text: "Reads the text forwards and backwards." },
              { title: "TCN", text: "Captures patterns across the sequence with convolutions." },
              { title: "Attention", text: "Weighs the parts of the input that matter most." },
              { title: "Classify", text: "Labels the article as real or fake." }
            ] }
          ]
        },
        {
          id: "recognition", title: "Recognition",
          blocks: [
            { t: "p", text: "The project received the SGU Best Project Award for 2021–22, and the paper was published in IEEE Xplore in 2023." },
            { t: "links", items: [
              { kicker: "Paper · IEEE Xplore", title: "Fake News Detection Using Hybrid BiLSTM-TCN Model with Attention Mechanism", href: "https://ieeexplore.ieee.org/document/10140491" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "BiLSTM", def: "Bidirectional Long Short-Term Memory: a recurrent network that reads a sequence in both directions." },
        { term: "TCN", def: "Temporal Convolutional Network: a convolutional model for sequences." },
        { term: "Attention", def: "A mechanism that lets a model weigh some inputs more than others." }
      ],
      related: ["dementia-review", "linketa", "text2simulation"]
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Thinking: the method                                                */
  /* ------------------------------------------------------------------ */
  SITE.process = [
    {
      title: "Start with the raw trace",
      rule: "A model inherits every flaw in its data. Before modelling, I clean and structure the data myself: screen it, match it to the real world, and check what is left.",
      project: "LinkETA", value: "8M+",
      proof: "road-segment data points, built by a geospatial ETL pipeline from raw taxi GPS trips.",
      link: "linketa", linkLabel: "See the pipeline"
    },
    {
      title: "Compare against the strongest baseline",
      rule: "A result only means something next to a serious alternative. I benchmark against the strongest systems I can find, including ones used in industry.",
      project: "LinkETA", value: "23.7%",
      proof: "lower error than Baidu's DuETA, and 17.6% lower than Uber's DeeprETA, on average.",
      link: "linketa", linkLabel: "See the comparison"
    },
    {
      title: "Design for the city with no data",
      rule: "Real deployments start where data is thin. I test whether a method still works when a new place has only a handful of examples.",
      project: "LinkETA", value: "25 trips",
      proof: "per new city were enough for meta-learning to cut road-segment error by up to 14.2%.",
      link: "note-25-trips", linkLabel: "Read the note"
    },
    {
      title: "Put the model inside a system",
      rule: "A model becomes useful when something depends on it. I integrate models into the tools that will use them and watch how they behave there.",
      project: "DTUMOS", value: "1 min",
      proof: "simulation steps, with LinkETA supplying traffic-aware travel times inside the digital twin.",
      link: "dtumos", linkLabel: "See DTUMOS"
    },
    {
      title: "Check before you trust",
      rule: "Fluent output is not correct output, and lab accuracy is not real-world accuracy. I build checks into systems and look for evidence outside controlled settings.",
      project: "Text2Simulation", value: "96.7%",
      proof: "of unsupported requests caught by the verifier, with zero false alarms.",
      link: "text2simulation", linkLabel: "See the verifier"
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Thinking: research notes                                            */
  /* ------------------------------------------------------------------ */
  SITE.notes = [
    {
      id: "note-link-level",
      title: "Why predict travel time one road at a time",
      titleLines: ["Why predict travel", "time one road", "at a time"],
      dek: "Trip-level ETA gives one number. Link-level ETA gives a building block that every route can reuse.",
      tags: ["ETA", "Graph ML"],
      project: "linketa",
      sections: [
        { id: "one-number", title: "One number per trip", blocks: [
          { t: "p", text: "Ask a map app how long a drive will take and you get one number. Many ETA models are built to produce exactly that. They take the whole route as input and predict its total time, which is a sensible design if a single answer is all you need." },
          { t: "p", text: "Routing and dispatch systems need more. A routing engine compares many candidate routes before it picks one. A dispatch system estimates pickup times for many taxis at once. Each of those routes is a different combination of the same road segments." }
        ] },
        { id: "the-road", title: "The road as the unit", blocks: [
          { t: "p", text: "Link-level estimation changes the question. Instead of predicting a trip, it predicts each road segment, or link. A route's ETA is the sum of its links, and one set of link predictions can serve every route that uses them." },
          { t: "quote", text: "Predict the road once, and every route that uses it can reuse the answer." },
          { t: "p", text: "It also makes errors easier to trace. When an ETA is off, you can see which segment caused it." }
        ] },
        { id: "graph", title: "Why a graph", blocks: [
          { t: "p", text: "Links don't behave independently. Congestion on one segment backs up into the segments that feed it, while a side street next to a jammed arterial can stay clear. LinkETA treats the road network as a graph with more than one kind of relationship between segments, and uses a Graph Transformer so each prediction can draw on the segments around it." }
        ] },
        { id: "result", title: "What it bought", blocks: [
          { t: "p", text: "On average, LinkETA had 23.7% lower error than Baidu's DuETA and 17.6% lower error than Uber's DeeprETA, while keeping prediction latency low. Its link-level predictions now feed the <a href=\"#dtumos\">DTUMOS</a> digital twin." }
        ] }
      ]
    },
    {
      id: "note-say-no",
      title: "Teaching an LLM agent to say no",
      titleLines: ["Teaching an", "LLM agent", "to say no"],
      dek: "A natural-language interface has to understand requests. It also has to know when to refuse one.",
      tags: ["LLM agents", "Verification"],
      project: "text2simulation",
      sections: [
        { id: "appeal", title: "The appeal", blocks: [
          { t: "p", text: "Simulation platforms are powerful and hard to configure. Text2Simulation lets someone describe a scenario in plain language. An agent built with GPT-4o and LangGraph turns the request into a DTUMOS configuration and runs it." }
        ] },
        { id: "failure", title: "The failure mode", blocks: [
          { t: "p", text: "Language models are agreeable. Given a request the simulator cannot handle, a model will often still return a tidy, confident configuration, and nothing in the output says the request was impossible." },
          { t: "quote", text: "A configuration that looks valid is not the same as one the simulator can run." }
        ] },
        { id: "check", title: "A check outside the model", blocks: [
          { t: "p", text: "So the agent doesn't get the final word. Each configuration passes through a verification module that validates it against what the digital twin can actually do. Unsupported requests are stopped before the simulation runs." },
          { t: "p", text: "The verifier makes no extra LLM calls, so the check adds no model cost." }
        ] },
        { id: "numbers", title: "How well it worked", blocks: [
          { t: "p", text: "The module caught 96.7% of unsupported requests with zero false alarms, so it never blocked a request the system could run. Both numbers matter. A missed request wastes a run, and false alarms teach people to ignore the check." }
        ] }
      ]
    },
    {
      id: "note-25-trips",
      title: "Twenty-five trips to learn a new city",
      titleLines: ["Twenty-five trips", "to learn a", "new city"],
      dek: "How meta-learning helps a travel-time model start in a city it has barely seen.",
      tags: ["Meta-learning", "Transfer"],
      project: "linketa",
      sections: [
        { id: "cold-start", title: "The cold-start problem", blocks: [
          { t: "p", text: "Every city is different: road layouts, signal timing, driving habits. A travel-time model trained in one city carries assumptions that may not hold in the next, and a new city rarely arrives with years of trip data." }
        ] },
        { id: "adapt", title: "Learning to adapt", blocks: [
          { t: "p", text: "Meta-learning changes the goal of training. Instead of fitting one city as well as possible, the model learns a starting point that adapts quickly to a new one. Model-Agnostic Meta-Learning (MAML) and OpenAI's Reptile are two well-known ways to do this." },
          { t: "p", text: "I developed a heuristic method built on both, aimed at road-segment travel time in cities the model hasn't seen." }
        ] },
        { id: "result", title: "Twenty-five trips", blocks: [
          { t: "p", text: "Using only 25 trips per city, the method cut road-segment error by up to 14.2% and ran 13 times faster per trip." },
          { t: "quote", text: "The question shifts from how much data a city has to how quickly a model can learn from it." }
        ] },
        { id: "why", title: "Why it matters", blocks: [
          { t: "p", text: "This is what makes a travel-time model portable. A digital twin or dispatch service can start in a new city with a small sample instead of waiting for a large dataset to build up." }
        ] }
      ]
    },
    {
      id: "note-lab-vs-care",
      title: "What lab accuracy doesn't tell you",
      titleLines: ["What lab accuracy", "doesn't tell you"],
      dek: "Notes from a systematic review of emotion recognition for dementia care.",
      tags: ["Affective computing", "Evaluation"],
      project: "dementia-review",
      sections: [
        { id: "review", title: "The review", blocks: [
          { t: "p", text: "With SQUAD Lab at Wilfrid Laurier University, I conducted a systematic review of multimodal affect recognition by socially assistive robots in dementia care. It covered 31 studies across facial, speech, physiological and body-movement signals." }
        ] },
        { id: "gap", title: "The gap", blocks: [
          { t: "p", text: "The clearest pattern was a gap between settings. Accuracy reported in lab conditions did not hold in real-world care." },
          { t: "p", text: "I see the same pattern in my mobility work. It is why I test travel-time models on new cities, not only on the city they were trained on." },
          { t: "quote", text: "Where a model is tested shapes what its accuracy means." }
        ] },
        { id: "data", title: "The data", blocks: [
          { t: "p", text: "I also catalogued 31 public emotion datasets used in dementia studies. Knowing what data exists is the first step to seeing what is missing." }
        ] },
        { id: "take", title: "What I take from it", blocks: [
          { t: "p", text: "Report where a result was measured, and test as close to real use as possible." }
        ] }
      ]
    }
  ];

  /* ------------------------------------------------------------------ */
  /* About                                                               */
  /* ------------------------------------------------------------------ */
  SITE.bio = [
    "I'm a machine learning researcher in Waterloo, Ontario, working on travel-time estimation and digital twins for urban mobility.",
    "At the SPIN Lab at Wilfrid Laurier University, my work runs from raw data to a usable system. I've built a pipeline that turns taxi GPS traces into millions of road-segment travel times, a graph model that predicts those times, a dispatch simulation that matches taxis to passengers, and an LLM agent that sets up those simulations from plain language.",
    "Before my master's, I spent two years as an IT consultant in Mumbai, leading web products for the glass façade industry and coordinating a five-person team."
  ];

  SITE.timeline = [
    { when: "Jan 2025 – present", type: "Work", role: "Research Assistant", org: "SPIN Lab, Wilfrid Laurier University, Waterloo",
      text: "Travel-time estimation and digital twins for urban mobility: <a href=\"#linketa\">LinkETA</a>, <a href=\"#dtumos\">DTUMOS</a>, <a href=\"#text2simulation\">Text2Simulation</a>, and a <a href=\"#dementia-review\">systematic review</a> with SQUAD Lab." },
    { when: "Jan 2025 – Apr 2026", type: "Teaching", role: "Graduate Teaching Assistant", org: "Wilfrid Laurier University, Waterloo",
      text: "CP421 Data Mining (MapReduce, clustering, recommender systems) and CP476 Internet Computing (web development). Managed student groups, graded assignments, projects and presentations, and proctored exams." },
    { when: "Sep 2024 – Apr 2026", type: "Education", role: "Master of Applied Computing", org: "Wilfrid Laurier University, Waterloo",
      text: "GPA 10.75/12. Award for Outstanding Graduate Work, Class of 2026. Thesis: <a href=\"https://scholars.wlu.ca/etd/2908/\" target=\"_blank\" rel=\"noopener\">Intelligent Digital Twin System for Urban Mobility</a>." },
    { when: "Jun 2022 – Jun 2024", type: "Work", role: "IT Consultant", org: "Glazingshopee, Mumbai",
      text: "Led product development for FacadeMart, Buyglass24 and EdFacade, and coordinated a 5-person cross-functional team. <a href=\"#glazingshopee\">Read the case study</a>." },
    { when: "Jul 2018 – May 2022", type: "Education", role: "B.Tech. in Computer Science and Engineering", org: "Sanjay Ghodawat University, Kolhapur",
      text: "GPA 8.29/10. SGU Best Project Award (2021–22) for <a href=\"#fake-news\">fake news detection</a>." }
  ];

  SITE.awards = [
    { value: "2026", title: "Award for Outstanding Graduate Work", text: "Wilfrid Laurier University, Class of 2026." },
    { value: "$48K", title: "Graduate funding", text: "CAD, awarded during the master's program." },
    { value: "$6K", title: "Graduate studentship", text: "CAD, awarded during the master's program." },
    { value: "2021–22", title: "SGU Best Project Award", text: "For the fake news detection paper, Sanjay Ghodawat University." }
  ];

  SITE.publications = [
    { title: "Intelligent Digital Twin System for Urban Mobility", meta: "Master's thesis · Wilfrid Laurier University · 2026", href: "https://scholars.wlu.ca/etd/2908/" },
    { title: "LinkETA: A Multi-Relational Graph Transformer for Link-Level Travel Time Estimation", meta: "Preprint · SSRN", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7379984" },
    { title: "Link-Level Spatio-Temporal Travel Time Prediction for Multi-Modal Commute Trip Estimation", meta: "IEEE Xplore" },
    { title: "Text2Simulation: A Natural Language Interface for Transportation Digital Twin Systems", meta: "IEEE Xplore" },
    { title: "Fake News Detection Using Hybrid BiLSTM-TCN Model with Attention Mechanism", meta: "IEEE Xplore · 2023", href: "https://ieeexplore.ieee.org/document/10140491" }
  ];

  SITE.skills = [
    { group: "Machine learning", items: ["Python", "R", "Transformers", "GNN", "CNN", "LSTM", "NLP", "DQN", "LLMs", "Spatiotemporal prediction", "Meta-learning", "Reinforcement learning", "Recommendation systems", "Clustering", "LangChain", "LangGraph"] },
    { group: "Maps and geospatial", items: ["OSRM", "OpenStreetMap", "Map matching", "OR-Tools", "GeoPandas", "Shapely", "Folium", "Simulation"] },
    { group: "Libraries", items: ["NumPy", "Pandas", "SciPy", "scikit-learn", "PyTorch", "TensorFlow", "Keras", "PyG", "Matplotlib", "Seaborn"] },
    { group: "Data and engineering", items: ["SQL (MySQL)", "MongoDB", "Hadoop", "CUDA", "Airflow", "Git", "AWS", "Docker", "Jira", "Agile", "PRISMA reviews", "Unit testing", "QA testing"] }
  ];

  /* ------------------------------------------------------------------ */
  /* Poems                                                               */
  /* Add a poem: copy one entry, give it a new id starting with "poem-", */
  /* and split stanzas with commas (each stanza is one string; "\n"     */
  /* starts a new line). Mark one poem featured: true for the top card. */
  /* Untitled poems use their first line as the title. credit: an        */
  /* acknowledgement shown under the title (e.g. lines from Rumi).       */
  /* lede is the line under the page title; leave it "" to hide it.     */
  /* ------------------------------------------------------------------ */
  SITE.poemsPage = {
    kicker: "Writing",
    title: "Poems",
    lede: ""
  };

  SITE.poems = [
    { id: "poem-white-clouds", title: "As the white clouds drift", featured: true, stanzas: [
      "As the white clouds drift,\nAnd the green grass bows,\nAs the Sunlit warmth spreads,\nAnd the River’s song flows,\nI wander, borne on the breeze\nWith a heart that longs,\nFor a place it knows."
    ] },
    { id: "poem-sunset", title: "Walking, running, chasing, tracking", stanzas: [
      "Walking, running, chasing, tracking\nIn the pursuit of a sunset lacking,\nMet with trees, people, birds, and lakes,\nYet still no glimpse my eyes could take.\nThese little failures, sharp as knives,\nMark the chapters of my cheerful life."
    ] },
    { id: "poem-souls-ache", title: "As they speak not of the world", credit: "The last two lines are from Rumi.", stanzas: [
      "As they speak not of the world,\nbut of the soul’s secret ache,\nof longing that has no name,\nbut is beyond touch and time.\nThe night listens and the heavens lie,\nWhile stars burn deep in that dreamer’s eye.\nEveryone sleeps, except lovers,\nwho stay awake, telling stories to god."
    ] }
  ];

  /* ------------------------------------------------------------------ */
  /* Photography                                                         */
  /* Add photos: drop the originals (HEIC, JPG, PNG) into                */
  /* e:\Projects\Resume\photos-to-add\ and run                           */
  /*   python portfolio/scripts/add-photos.py                            */
  /* It strips location/camera data, fixes rotation, makes web-sized    */
  /* copies in assets/photos/ and adds them to the top of the list      */
  /* below. Then fill in alt (what the photo shows, for screen readers),*/
  /* title, place and note. The list order is the order on the page.    */
  /* Keep the list between the PHOTOS markers in strict JSON (double    */
  /* quotes, no trailing commas): the script reads and rewrites it.     */
  /* Entries with no src show a placeholder frame.                      */
  /* ------------------------------------------------------------------ */
  SITE.photographyPage = {
    kicker: "Seeing",
    title: "Photography",
    lede: "Capturing the world as I walk by it."
  };

  // PHOTOS-START (managed by portfolio/scripts/add-photos.py)
  SITE.photos = [
    {"id": "photo-032", "src": "assets/photos/photo-032.jpg", "thumb": "assets/photos/photo-032-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A tree in deep red autumn leaves, its fallen leaves carpeting the ground beneath.", "title": "Crimson", "place": "", "year": "2026", "note": ""},
    {"id": "photo-033", "src": "assets/photos/photo-033.jpg", "thumb": "assets/photos/photo-033-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A dark, rain-streaked window reflecting a hand holding up a phone.", "title": "Rain on glass", "place": "", "year": "2026", "note": ""},
    {"id": "photo-034", "src": "assets/photos/photo-034.jpg", "thumb": "assets/photos/photo-034-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A library atrium with curved white balconies and a skylight, seen past a laptop screen and a coffee cup.", "title": "Reading room", "place": "", "year": "2026", "note": ""},
    {"id": "photo-035", "src": "assets/photos/photo-035.jpg", "thumb": "assets/photos/photo-035-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Looking up a tall tree with bright yellow autumn leaves, the sun shining through.", "title": "Gold", "place": "", "year": "2026", "note": ""},
    {"id": "photo-001", "src": "assets/photos/photo-001.jpg", "thumb": "assets/photos/photo-001-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Looking straight up into maple trees in full autumn colour, orange on the left and yellow on the right, with a dark trunk cutting across.", "title": "Maple canopy", "place": "", "year": "2026", "note": ""},
    {"id": "photo-036", "src": "assets/photos/photo-036.jpg", "thumb": "assets/photos/photo-036-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A bright full moon behind thin, dark clouds.", "title": "Moon in the clouds", "place": "", "year": "2026", "note": ""},
    {"id": "photo-037", "src": "assets/photos/photo-037.jpg", "thumb": "assets/photos/photo-037-sm.jpg", "w": 1782, "h": 1683, "tw": 720, "ratio": "18 / 17", "alt": "Four gulls on a rooftop ledge beside a large full moon rising in a pale sky.", "title": "Moonrise, with gulls", "place": "", "year": "2026", "note": ""},
    {"id": "photo-038", "src": "assets/photos/photo-038.jpg", "thumb": "assets/photos/photo-038-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "An orange sunset behind silhouetted power lines and a transmission tower.", "title": "Sunset on the grid", "place": "", "year": "2026", "note": ""},
    {"id": "photo-039", "src": "assets/photos/photo-039.jpg", "thumb": "assets/photos/photo-039-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "An old-fashioned street lamp glowing among red autumn leaves, crossed by a ray of sunlight.", "title": "Lamplight", "place": "", "year": "2026", "note": ""},
    {"id": "photo-002", "src": "assets/photos/photo-002.jpg", "thumb": "assets/photos/photo-002-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Maple branches seen from below, the leaves turning from green to deep crimson.", "title": "Turning red", "place": "", "year": "2026", "note": ""},
    {"id": "photo-040", "src": "assets/photos/photo-040.jpg", "thumb": "assets/photos/photo-040-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A plated dessert dusted with cinnamon and drizzled with chocolate, on a wooden table, seen from above.", "title": "Something sweet", "place": "", "year": "2026", "note": ""},
    {"id": "photo-003", "src": "assets/photos/photo-003.jpg", "thumb": "assets/photos/photo-003-sm.jpg", "w": 1751, "h": 1713, "tw": 720, "ratio": "1751 / 1713", "alt": "A large tree shading an empty picnic table on a lawn scattered with fallen leaves, with red and yellow trees beyond.", "title": "Picnic table", "place": "", "year": "2026", "note": ""},
    {"id": "photo-004", "src": "assets/photos/photo-004.jpg", "thumb": "assets/photos/photo-004-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A tall maple beside a street, turning red and orange from the top down against a clear blue sky, its fallen leaves on the grass.", "title": "Street maple", "place": "", "year": "2026", "note": ""},
    {"id": "photo-005", "src": "assets/photos/photo-005.jpg", "thumb": "assets/photos/photo-005-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Close-up of a deep red pompon dahlia among green leaves and stems.", "title": "Dahlia", "place": "", "year": "2026", "note": ""},
    {"id": "photo-006", "src": "assets/photos/photo-006.jpg", "thumb": "assets/photos/photo-006-sm.jpg", "w": 1533, "h": 1957, "tw": 720, "ratio": "1533 / 1957", "alt": "A cluster of red pompon dahlias, some still in bud, growing tall in a sunny garden.", "title": "Dahlias", "place": "", "year": "2026", "note": ""},
    {"id": "photo-007", "src": "assets/photos/photo-007.jpg", "thumb": "assets/photos/photo-007-sm.jpg", "w": 1896, "h": 1582, "tw": 720, "ratio": "948 / 791", "alt": "A sky full of small rippled clouds lit gold and orange by the setting sun, with a single streetlight at the bottom.", "title": "Mackerel sky", "place": "", "year": "2026", "note": ""},
    {"id": "photo-008", "src": "assets/photos/photo-008.jpg", "thumb": "assets/photos/photo-008-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A blue and white floral mug on a sunlit wooden picnic table, with green trees behind.", "title": "Morning mug", "place": "", "year": "2026", "note": ""},
    {"id": "photo-041", "src": "assets/photos/photo-041.jpg", "thumb": "assets/photos/photo-041-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Orange and yellow maple leaves around a dark trunk, lit by the sun.", "title": "October maple", "place": "", "year": "2026", "note": ""},
    {"id": "photo-043", "src": "assets/photos/photo-043.jpg", "thumb": "assets/photos/photo-043-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A long, narrow aisle between tall library shelves full of books.", "title": "The stacks", "place": "", "year": "2026", "note": ""},
    {"id": "photo-009", "src": "assets/photos/photo-009.jpg", "thumb": "assets/photos/photo-009-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A Canada goose standing on grass, looking toward the camera, with a road and trees behind it.", "title": "Canada goose", "place": "", "year": "2026", "note": ""},
    {"id": "photo-010", "src": "assets/photos/photo-010.jpg", "thumb": "assets/photos/photo-010-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A busy downtown street with traffic lights, a glass pedestrian bridge and tall buildings, including an ornate stone tower on the right.", "title": "Downtown", "place": "", "year": "2026", "note": ""},
    {"id": "photo-044", "src": "assets/photos/photo-044.jpg", "thumb": "assets/photos/photo-044-sm.jpg", "w": 1491, "h": 2013, "tw": 720, "ratio": "497 / 671", "alt": "A polished slice of a pallasite meteorite, golden olivine crystals set in metal, lit in a museum case.", "title": "Pallasite meteorite", "place": "", "year": "2026", "note": ""},
    {"id": "photo-046", "src": "assets/photos/photo-046.jpg", "thumb": "assets/photos/photo-046-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Two garden chairs in the shade of a large tree beside a chain-link fence, with sunlight through the leaves.", "title": "Two chairs", "place": "", "year": "2026", "note": ""},
    {"id": "photo-047", "src": "assets/photos/photo-047.jpg", "thumb": "assets/photos/photo-047-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A pan of rice noodles with spinach, shrimp, corn and peppers on the stove.", "title": "Home cooking", "place": "", "year": "2026", "note": ""},
    {"id": "photo-048", "src": "assets/photos/photo-048.jpg", "thumb": "assets/photos/photo-048-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A calm river reflecting the green trees that overhang its banks.", "title": "Still river", "place": "", "year": "2026", "note": ""},
    {"id": "photo-049", "src": "assets/photos/photo-049.jpg", "thumb": "assets/photos/photo-049-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Stars over three silhouetted trees, with a faint glow along the horizon.", "title": "Before dawn", "place": "", "year": "2026", "note": ""},
    {"id": "photo-050", "src": "assets/photos/photo-050.jpg", "thumb": "assets/photos/photo-050-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A dark night sky scattered with faint stars.", "title": "Stars", "place": "", "year": "2026", "note": ""},
    {"id": "photo-051", "src": "assets/photos/photo-051.jpg", "thumb": "assets/photos/photo-051-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "Faint stars across a dark night sky.", "title": "Stargazing", "place": "", "year": "2026", "note": ""},
    {"id": "photo-011", "src": "assets/photos/photo-011.jpg", "thumb": "assets/photos/photo-011-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A modern glass building across a pond, seen through overhanging branches above a green lawn and footpath.", "title": "Across the pond", "place": "", "year": "2026", "note": ""},
    {"id": "photo-052", "src": "assets/photos/photo-052.jpg", "thumb": "assets/photos/photo-052-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Two grey squirrels in tall grass at the foot of a tree, one looking at the camera.", "title": "Two squirrels", "place": "", "year": "2026", "note": ""},
    {"id": "photo-053", "src": "assets/photos/photo-053.jpg", "thumb": "assets/photos/photo-053-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A shelf of painted Star Wars miniature figures, with white-armoured troopers in front.", "title": "Figurines", "place": "", "year": "2026", "note": ""},
    {"id": "photo-054", "src": "assets/photos/photo-054.jpg", "thumb": "assets/photos/photo-054-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A full moon glowing pale gold against a black sky.", "title": "Gold moon", "place": "", "year": "2026", "note": ""},
    {"id": "photo-055", "src": "assets/photos/photo-055.jpg", "thumb": "assets/photos/photo-055-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A striped garter snake crossing grey asphalt.", "title": "Crossing", "place": "", "year": "2026", "note": ""},
    {"id": "photo-056", "src": "assets/photos/photo-056.jpg", "thumb": "assets/photos/photo-056-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Marigolds and purple salvia in front of a Wilfrid Laurier University sign and a concrete building.", "title": "Laurier in bloom", "place": "", "year": "2026", "note": ""},
    {"id": "photo-057", "src": "assets/photos/photo-057.jpg", "thumb": "assets/photos/photo-057-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A Tim Hortons sign glowing against a black night sky above the lit restaurant.", "title": "Always fresh", "place": "", "year": "2026", "note": ""},
    {"id": "photo-012", "src": "assets/photos/photo-012.jpg", "thumb": "assets/photos/photo-012-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A tall cumulus cloud glowing orange and pink at sunset against a purple-blue sky.", "title": "Sunset cumulus", "place": "", "year": "2026", "note": ""},
    {"id": "photo-013", "src": "assets/photos/photo-013.jpg", "thumb": "assets/photos/photo-013-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A passenger jet crossing a clear blue sky.", "title": "Passing over", "place": "", "year": "2026", "note": ""},
    {"id": "photo-058", "src": "assets/photos/photo-058.jpg", "thumb": "assets/photos/photo-058-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A cluster of yellow black-eyed Susan flowers in green grass.", "title": "Black-eyed Susans", "place": "", "year": "2026", "note": ""},
    {"id": "photo-062", "src": "assets/photos/photo-062.jpg", "thumb": "assets/photos/photo-062-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "Lit buildings and the moon reflected in a still pond at night.", "title": "Still water", "place": "", "year": "2026", "note": ""},
    {"id": "photo-015", "src": "assets/photos/photo-015.jpg", "thumb": "assets/photos/photo-015-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A long, straight small-town main street dipping downhill and rising on the far side, lined with shops, parked cars and trees.", "title": "Main street", "place": "", "year": "2026", "note": ""},
    {"id": "photo-063", "src": "assets/photos/photo-063.jpg", "thumb": "assets/photos/photo-063-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A white water lily among green and purple lily pads on a pond.", "title": "Water lily", "place": "", "year": "2026", "note": ""},
    {"id": "photo-016", "src": "assets/photos/photo-016.jpg", "thumb": "assets/photos/photo-016-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A man in a hat walking a golden retriever along a sandy beach, with sunlit water stretching to the horizon.", "title": "Shoreline walk", "place": "", "year": "2026", "note": ""},
    {"id": "photo-017", "src": "assets/photos/photo-017.jpg", "thumb": "assets/photos/photo-017-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Shallow rapids running over a rocky riverbed under a deep blue sky, with forest on the far bank.", "title": "Rapids", "place": "", "year": "2026", "note": ""},
    {"id": "photo-064", "src": "assets/photos/photo-064.jpg", "thumb": "assets/photos/photo-064-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A narrow dirt path through a sunlit green forest.", "title": "Forest path", "place": "", "year": "2026", "note": ""},
    {"id": "photo-066", "src": "assets/photos/photo-066.jpg", "thumb": "assets/photos/photo-066-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A man standing at the edge of a lake, watching pink and orange sunset clouds reflected in the water.", "title": "Watching the sunset", "place": "", "year": "2026", "note": ""},
    {"id": "photo-018", "src": "assets/photos/photo-018.jpg", "thumb": "assets/photos/photo-018-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A white folding garden chair on bright green grass beside a weathered wooden fence.", "title": "Garden chair", "place": "", "year": "2026", "note": ""},
    {"id": "photo-068", "src": "assets/photos/photo-068.jpg", "thumb": "assets/photos/photo-068-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A female mallard duck standing on green grass.", "title": "Mallard", "place": "", "year": "2026", "note": ""},
    {"id": "photo-069", "src": "assets/photos/photo-069.jpg", "thumb": "assets/photos/photo-069-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A wide green lawn framed by pine branches and leafy trees under a blue sky.", "title": "Open lawn", "place": "", "year": "2026", "note": ""},
    {"id": "photo-019", "src": "assets/photos/photo-019.jpg", "thumb": "assets/photos/photo-019-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A misty lake with a single waterbird on still water and a tree-lined shore fading into the fog.", "title": "Fog", "place": "", "year": "2026", "note": ""},
    {"id": "photo-070", "src": "assets/photos/photo-070.jpg", "thumb": "assets/photos/photo-070-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A white swan gliding on a green pond, reflected in the water.", "title": "Swan", "place": "", "year": "2026", "note": ""},
    {"id": "photo-071", "src": "assets/photos/photo-071.jpg", "thumb": "assets/photos/photo-071-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A ring-billed gull standing on a white ledge in front of a blue and white kiosk.", "title": "Ring-billed gull", "place": "", "year": "2026", "note": ""},
    {"id": "photo-072", "src": "assets/photos/photo-072.jpg", "thumb": "assets/photos/photo-072-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Canada geese leading a line of fluffy goslings across a lawn, with a footbridge behind.", "title": "Goslings", "place": "", "year": "2026", "note": ""},
    {"id": "photo-073", "src": "assets/photos/photo-073.jpg", "thumb": "assets/photos/photo-073-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A thin crescent moon in a deep blue evening sky above dark trees.", "title": "Crescent at dusk", "place": "", "year": "2026", "note": ""},
    {"id": "photo-074", "src": "assets/photos/photo-074.jpg", "thumb": "assets/photos/photo-074-sm.jpg", "w": 1732, "h": 1732, "tw": 720, "ratio": "1 / 1", "alt": "Toronto City Hall's two curved towers lit purple at night behind a large Christmas tree.", "title": "City Hall at Christmas", "place": "Toronto", "year": "2025", "note": ""},
    {"id": "photo-076", "src": "assets/photos/photo-076.jpg", "thumb": "assets/photos/photo-076-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A cuttlefish close up in an aquarium tank, its patterned skin catching the light.", "title": "Close encounter", "place": "", "year": "2025", "note": ""},
    {"id": "photo-020", "src": "assets/photos/photo-020.jpg", "thumb": "assets/photos/photo-020-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A dense school of silver fish swirling through blue aquarium water.", "title": "School of fish", "place": "", "year": "2025", "note": ""},
    {"id": "photo-021", "src": "assets/photos/photo-021.jpg", "thumb": "assets/photos/photo-021-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "The CN Tower rising between glass towers, seen from a downtown street.", "title": "CN Tower", "place": "Toronto", "year": "2025", "note": ""},
    {"id": "photo-022", "src": "assets/photos/photo-022.jpg", "thumb": "assets/photos/photo-022-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "The CN Tower beside a curved glass skyscraper and an older stone building with columns, under a sky of scattered clouds.", "title": "Old and new", "place": "Toronto", "year": "2025", "note": ""},
    {"id": "photo-077", "src": "assets/photos/photo-077.jpg", "thumb": "assets/photos/photo-077-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Picnic tables under tall trees in a park, the ground covered with fallen leaves.", "title": "Autumn picnic", "place": "", "year": "2025", "note": ""},
    {"id": "photo-078", "src": "assets/photos/photo-078.jpg", "thumb": "assets/photos/photo-078-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "alt": "A bronze statue on a stone base in a circle of flowers, with red and yellow autumn trees behind.", "title": "Monument in autumn", "place": "", "year": "2025", "note": ""},
    {"id": "photo-079", "src": "assets/photos/photo-079.jpg", "thumb": "assets/photos/photo-079-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A table spread with a roast chicken, rice, naan, salad and side dishes, seen from above.", "title": "Feast", "place": "", "year": "2025", "note": ""},
    {"id": "photo-023", "src": "assets/photos/photo-023.jpg", "thumb": "assets/photos/photo-023-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A thin crescent moon with a bright planet beside it in a dark blue sky, above silhouetted trees.", "title": "Before sunrise", "place": "", "year": "2025", "note": ""},
    {"id": "photo-025", "src": "assets/photos/photo-025.jpg", "thumb": "assets/photos/photo-025-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "The sun dipping behind silhouetted trees, under a wide sky of golden and grey clouds.", "title": "Last light", "place": "", "year": "2025", "note": ""},
    {"id": "photo-026", "src": "assets/photos/photo-026.jpg", "thumb": "assets/photos/photo-026-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A half moon glowing deep orange in a black night sky.", "title": "Orange moon", "place": "", "year": "2025", "note": ""},
    {"id": "photo-027", "src": "assets/photos/photo-027.jpg", "thumb": "assets/photos/photo-027-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A thin crescent moon in a patch of deep blue sky, framed by clouds lit pink and gold.", "title": "Crescent", "place": "", "year": "2025", "note": ""},
    {"id": "photo-028", "src": "assets/photos/photo-028.jpg", "thumb": "assets/photos/photo-028-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A grey squirrel sitting upright at the base of a tree trunk, its tail curled up behind it, in tall green grass.", "title": "Watchful", "place": "", "year": "2025", "note": ""},
    {"id": "photo-029", "src": "assets/photos/photo-029.jpg", "thumb": "assets/photos/photo-029-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "The sun setting over a lake, framed by dark tree branches, its reflection on the water and a small building on the shore.", "title": "Lakeside sunset", "place": "", "year": "2025", "note": ""},
    {"id": "photo-030", "src": "assets/photos/photo-030.jpg", "thumb": "assets/photos/photo-030-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Canada geese grazing on a wide lawn in warm evening light, one in the foreground, with tall evergreens behind.", "title": "Grazing geese", "place": "", "year": "2025", "note": ""},
    {"id": "photo-031", "src": "assets/photos/photo-031.jpg", "thumb": "assets/photos/photo-031-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A wide, calm river between wooded banks under a blue sky with puffy white clouds.", "title": "Riverbend", "place": "", "year": "2025", "note": ""},
    {"id": "photo-081", "src": "assets/photos/photo-081.jpg", "thumb": "assets/photos/photo-081-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A large crowd in green hats and shirts filling a street in front of a brick house.", "title": "St. Patrick's Day", "place": "", "year": "2025", "note": ""},
    {"id": "photo-082", "src": "assets/photos/photo-082.jpg", "thumb": "assets/photos/photo-082-sm.jpg", "w": 1206, "h": 2144, "tw": 720, "ratio": "9 / 16", "alt": "A Canada goose standing on a snowbank beside a tree trunk at sunset.", "title": "Goose in the snow", "place": "", "year": "2025", "note": ""},
    {"id": "photo-084", "src": "assets/photos/photo-084.jpg", "thumb": "assets/photos/photo-084-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A white and orange cat peering over the edge of a desk.", "title": "Curious cat", "place": "", "year": "2024", "note": ""},
    {"id": "photo-085", "src": "assets/photos/photo-085.jpg", "thumb": "assets/photos/photo-085-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "A flock of birds scattered across a clear blue sky.", "title": "Flock", "place": "", "year": "2024", "note": ""},
    {"id": "photo-086", "src": "assets/photos/photo-086.jpg", "thumb": "assets/photos/photo-086-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "alt": "Looking up into a tree with red, orange and green leaves against a blue sky.", "title": "Turning", "place": "", "year": "2024", "note": ""},
    {"id": "photo-087", "src": "assets/photos/photo-087.jpg", "thumb": "assets/photos/photo-087-sm.jpg", "w": 1301, "h": 2307, "tw": 720, "ratio": "1301 / 2307", "alt": "The silhouette of a person standing against a pale sky, seen from below.", "title": "Silhouette", "place": "", "year": "2022", "note": ""}
  ];
  // PHOTOS-END
})(typeof window !== "undefined" ? window : globalThis);
