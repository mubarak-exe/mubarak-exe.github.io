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
    coords: "43.465° N, 80.523° W",
    status: "Looking for machine learning and research roles in Canada.",
    // Website copy of the resume (title "Machine Learning Researcher", no phone number); built from resume.tex.
    resume: "assets/Mubarak_Shikalgar_Resume.pdf",
    // Formspree form ID for the About contact box (the part after formspree.io/f/). Empty = the form opens the visitor's email app.
    formspree: ""
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
      demo: "/demos/linketa/",   // the card opens the demo (separate page) instead of a case study
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
              { kicker: "Paper", title: "LinkETA: A Multi-Relational Graph Transformer for Link-Level Travel Time Estimation", text: "SSRN", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7379984" },
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
      related: ["metaeta", "multimodal-eta", "text2simulation"]
    },

    // From the CV (TRU_Mubarak_CV.tex, 2026-11-17). Results are described in words: the exact figures come from the
    // MetaETA manuscript, which is under review (his rule: no exact numbers from unpublished papers, especially MetaETA).
    {
      id: "metaeta",
      title: "MetaETA",
      titleLines: ["MetaETA"],
      type: "Research",
      tagline: "Meta-learning",
      tags: ["meta-learning", "few-shot", "graph attention", "travel time", "new cities", "ETA"],
      years: "2026",
      when: "Jan – Aug 2026",
      role: "Research Assistant",
      org: "SPIN Lab, Wilfrid Laurier University",
      tools: ["Python", "PyTorch", "Graph Attention Networks", "Meta-learning", "OpenStreetMap"],
      cover: "fewshot",
      seed: 19,
      featured: false,
      hook: "A graph model that learns from two cities, then estimates travel times on every road of a new city from 25 recorded trips, with no retraining.",
      thesis: "Travel-time estimates for a city with almost no data, from its first handful of trips, without training a new model.",
      metric: { value: "25", label: "trips to start estimating a new city" },
      outcomes: [
        { value: "2", label: "source cities, Porto and San Francisco" },
        { value: "25", label: "recorded trips per new city" },
        { value: "0", label: "retraining for a new city" }
      ],
      sections: [
        {
          id: "problem", title: "A new city has no history",
          blocks: [
            { t: "p", text: "ETA models learn from millions of past trips. A city that is new to a service has almost none, so a model trained elsewhere does not know its roads, and training a new one needs data that does not exist yet." },
            { t: "p", text: "Meta-learning methods such as Model-Agnostic Meta-Learning (MAML) and OpenAI's Reptile help, but they still retrain the model for every new city." }
          ]
        },
        {
          id: "approach", title: "Adapt without retraining",
          blocks: [
            { t: "p", text: "MetaETA is a Graph Attention Network trained on two source cities, Porto and San Francisco. In a new city it reads only the roads driven by a handful of recorded trips and estimates travel times on every road, with no retraining." },
            { t: "flow", label: "From two cities to a new one", steps: [
              { title: "Learn", text: "Trained on taxi trips in Porto and San Francisco." },
              { title: "Observe", text: "In a new city, read the roads driven by 25 recorded trips." },
              { title: "Estimate", text: "Predict travel times on every road of the new city." },
              { title: "Serve", text: "Give trip ETAs at once, with no retraining." }
            ] }
          ]
        },
        {
          id: "results", title: "Results",
          blocks: [
            { t: "p", text: "Tested in Chengdu, Daegu and Shanghai with as few as 25 recorded trips per city, MetaETA kept trip-time error low without retraining, and predicted each trip faster than the meta-learning methods that retrain." },
            { t: "links", items: [
              { kicker: "Paper · under review", title: "MetaETA: A Meta-Learning Framework for Link-Level Travel Time Estimation" },
              { kicker: "Project", title: "LinkETA", text: "The road-segment ETA model this work builds on.", view: "linketa" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "Meta-learning", def: "Training a model so it can adapt to a new task, here a new city, from very little data." },
        { term: "Few-shot", def: "Learning from only a few examples, here 25 recorded trips." },
        { term: "Graph Attention Network", def: "A neural network on a graph where each road weighs information from the roads around it." },
        { term: "Retraining", def: "Updating a model's weights on new data, which takes time and data a new city does not have." }
      ],
      related: ["linketa", "multimodal-eta", "text2simulation"]
    },

    // From the CV. The paper is accepted at IEEE WF-IoT 2026 but not yet published, so results are in words here too.
    {
      id: "multimodal-eta",
      title: "Multimodal ETA",
      titleLines: ["Multimodal", "ETA"],
      type: "Research",
      tagline: "Transit ETA",
      tags: ["multimodal", "bus", "transit", "dwell time", "GRU", "OpenTripPlanner", "ETA"],
      years: "2026",
      when: "Feb – May 2026",
      role: "Research Assistant",
      org: "SPIN Lab, Wilfrid Laurier University",
      tools: ["Python", "PyTorch", "LinkETA", "Bidirectional GRU", "OpenTripPlanner"],
      cover: "transit",
      seed: 23,
      featured: false,
      hook: "LinkETA extended to buses and built into OpenTripPlanner, to estimate commutes that mix bus and taxi.",
      thesis: "Door-to-door commute estimates that use traffic and stop dwell times, not just the bus timetable.",
      metric: { value: "61", label: "San Francisco Muni bus routes in the data" },
      outcomes: [
        { value: "59,335", label: "San Francisco Muni bus trips" },
        { value: "61", label: "bus routes" },
        { value: "2", label: "travel modes in one journey, bus and taxi" }
      ],
      sections: [
        {
          id: "problem", title: "Commutes mix modes",
          blocks: [
            { t: "p", text: "Many commutes combine a bus ride with a taxi. Trip planners usually estimate the bus legs from the timetable, which ignores traffic on the road and the time a bus waits at each stop." }
          ]
        },
        {
          id: "approach", title: "Roads and stops, both learned",
          blocks: [
            { t: "p", text: "I extended LinkETA to buses with a bidirectional GRU module that predicts the dwell time at each stop, trained on 59,335 San Francisco Muni trips over 61 routes. The model runs inside OpenTripPlanner, which plans the journey and asks it for the time of each bus and taxi leg." },
            { t: "flow", label: "One journey, two modes", steps: [
              { title: "Plan", text: "OpenTripPlanner finds the journey and its legs." },
              { title: "Bus legs", text: "LinkETA times each road segment, and the GRU adds the dwell time at each stop." },
              { title: "Taxi legs", text: "LinkETA times the drive in current traffic." },
              { title: "Journey ETA", text: "The legs add up to a door-to-door estimate." }
            ] }
          ]
        },
        {
          id: "results", title: "Results",
          blocks: [
            { t: "p", text: "On test trips across ten routes, the learned estimates cut the trip-time error of timetable-based estimates by about half, and model inference took milliseconds per trip, fast enough for trip planning." },
            { t: "links", items: [
              { kicker: "Paper · IEEE WF-IoT 2026 (to appear)", title: "Link-Level Spatio-Temporal Travel Time Prediction for Multi-Modal Commute Trip Estimation" },
              { kicker: "Project", title: "LinkETA", text: "The road-segment model inside each leg.", view: "linketa" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "Multimodal", def: "A journey that uses more than one way of travelling, here bus and taxi." },
        { term: "Dwell time", def: "How long a bus stays at a stop while passengers get on and off." },
        { term: "GRU", def: "Gated Recurrent Unit, a neural network for sequences. A bidirectional GRU reads the sequence of stops in both directions." },
        { term: "OpenTripPlanner", def: "Open-source software that plans journeys across buses, trains, walking and driving." }
      ],
      related: ["linketa", "metaeta", "text2simulation"]
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
      demo: "/demos/text2simulation/",   // the card opens the demo (replays saved runs) instead of a case study
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
            { t: "p", text: "DTUMOS, an open-source digital twin for urban mobility, can simulate a lot, but setting up a scenario means knowing its configuration options. That limits who can use it. A natural-language interface removes the barrier: describe the scenario and let an agent write the configuration." }
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
              { kicker: "Paper · IEEE GESS 2026 (to appear)", title: "Text2Simulation: A Natural Language Interface for Transportation Digital Twin Systems" },
              { kicker: "Finding", title: "Teaching an LLM agent to say no", text: "Why the verifier matters more than the parser.", view: "note-say-no" }
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
      related: ["linketa", "dementia-review", "glazingshopee"]
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
      demo: "/demos/igu-quote/",   // the card opens the demo (separate page) instead of a case study
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
      related: ["linketa", "text2simulation", "fake-news"]
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
      role: "Research Assistant",
      org: "SQUAD Lab, Wilfrid Laurier University",
      tools: ["Systematic review", "Multimodal affect recognition", "Socially Assistive Robots"],
      cover: "signals",
      seed: 29,
      featured: false,
      hook: "A systematic review of how Socially Assistive Robots recognize emotion in people living with dementia, and why lab results don't transfer.",
      thesis: "How well can Socially Assistive Robots recognize emotion in people living with dementia, and do lab results hold up in real care?",
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
            { t: "p", text: "Socially Assistive Robots are being studied as a support in dementia care. To respond well, a robot needs to recognize a person's emotional state. This review asked how well current methods do that, and whether the results hold up outside the lab." }
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
              { kicker: "Finding", title: "What lab accuracy doesn't tell you", text: "Notes from the review.", view: "note-lab-vs-care" }
            ] }
          ]
        }
      ],
      glossary: [
        { term: "Affect recognition", def: "Estimating a person's emotional state from signals such as the face, voice or body." },
        { term: "Multimodal", def: "Using more than one kind of signal at the same time." },
        { term: "Socially Assistive Robot", def:"A robot designed to help people through social interaction, such as conversation or companionship." },
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
  /* Methodology page (#thinking): the five rules                        */
  /* ------------------------------------------------------------------ */
  // Nine stages, grouped in four phases. does: what I do. practice: where I did it ("In practice").
  // visual: "pipeline" | "dashboard" | "service" draws a small diagram under the stage.
  SITE.processPhases = [
    { name: "Learn and understand", from: 0, to: 2 },
    { name: "Build", from: 3, to: 5 },
    { name: "Prove", from: 6, to: 6 },
    { name: "Deploy and publish", from: 7, to: 8 }
  ];
  SITE.process = [
    {
      title: "Landscape and Gap Analysis",
      does: "I trace how the field evolved, framework by framework, through systematic PRISMA reviews, then narrow the problem to the gap that remains unsolved.",
      practice: "A decade of travel-time research, traced to the gap that LinkETA fills.",
      link: "linketa", linkLabel: "See LinkETA"
    },
    {
      title: "Problem Formulation and Data Engineering",
      does: "I define inputs, outputs and the success metric precisely, then build ETL pipelines that turn raw data into clean, validated datasets, with leak and consistency checks at every step.",
      practice: "Raw GPS from taxis, private cars and buses, turned into 8M+ road-level data points across six datasets on three continents.",
      visual: "pipeline"
    },
    {
      title: "Exploratory Data Analysis",
      does: "I measure sparsity, check which features are available everywhere, and remove features that repeat the same information. These findings become the model's requirements.",
      practice: "Most observations sit on a few roads, so the model was built to handle roads it rarely sees."
    },
    {
      title: "Architecture Design",
      does: "I design each component to answer a specific limitation in the data, drawing on ideas from the literature.",
      practice: "MetaETA was built for cities with almost no data. It adapts to a new city from just 25 trips, with up to 14.2% lower road-segment error."
    },
    {
      title: "Benchmarking",
      does: "I implement state-of-the-art models, including production systems from Baidu and Uber, and test them on the same data and trips as my own.",
      practice: "Six published baselines. LinkETA had 23.7% lower error than Baidu's DuETA and 17.6% lower than Uber's DeeprETA.",
      link: "linketa", linkLabel: "See the comparison"
    },
    {
      title: "Training and Experimentation",
      does: "I fix every setting up front, check inputs automatically before training, cache prepared data for fast reruns, and split data by time so nothing leaks from test to training.",
      practice: "Five loss-balancing methods compared, with reproducible training runs on cloud GPUs."
    },
    {
      title: "Evaluation and Ablation",
      does: "I test reliability, statistical significance (t-test, Wilcoxon), error by trip type, generalisation to new cities and travel modes, robustness to missing data, and speed across hardware. Ablations remove one component at a time to measure its value. Results are tracked on dashboards with clear KPIs.",
      practice: "Recent traffic proved the strongest signal, and the road graph matters most where data is missing.",
      visual: "dashboard"
    },
    {
      title: "Deployment and MLOps",
      does: "I package trained models as REST APIs and deploy them on AWS for real-time use.",
      practice: "Multimodal ETA, a FastAPI service that brings predicted travel times into OpenTripPlanner for door-to-door journeys by walking, taxi and bus. It halves the bus travel-time error of timetable estimates (7.4% vs 15.2%). Text2Simulation runs as a web app.",
      link: "text2simulation", linkLabel: "See Text2Simulation",
      visual: "service"
    },
    {
      title: "Publication",
      does: "I publish methods and results, present them at conferences, and answer peer review point by point.",
      practice: "The LinkETA journal paper (under review), an IEEE WF-IoT 2026 talk, and a systematic review with SQUAD Lab.",
      link: "dementia-review", linkLabel: "See the review"
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Methodology page (#thinking): findings                              */
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
          { t: "p", text: "On average, LinkETA had 23.7% lower error than Baidu's DuETA and 17.6% lower error than Uber's DeeprETA, while keeping prediction latency low. Its link-level predictions now feed the DTUMOS digital twin." }
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
          { t: "p", text: "With SQUAD Lab at Wilfrid Laurier University, I conducted a systematic review of multimodal affect recognition by Socially Assistive Robots in dementia care. It covered 31 studies across facial, speech, physiological and body-movement signals." }
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
    "At the SPIN Lab at Wilfrid Laurier University, my work runs from raw data to a usable system. I've built a pipeline that turns taxi GPS traces into millions of road-segment travel times, graph models that predict those times, even in a new city from a handful of trips and for commutes that mix bus and taxi, a dispatch simulation that matches taxis to passengers, and an LLM agent that sets up those simulations from plain language.",
    "Before my master's, I spent two years as an IT consultant in Mumbai, leading web products for the glass façade industry and coordinating a five-person team."
  ];

  // Timeline, teaching, publications, talks, certifications, languages and affiliations: from the CV
  // (job_pipeline/applications/2026-11-10/TRU_SessionalFaculty/TRU_Mubarak_CV.tex, 2026-11-17). Teaching sits in its own section.
  SITE.timeline = [
    { when: "Jan 2025 – present", type: "Research", role: "Research Assistant", org: "SPIN Lab, Wilfrid Laurier University, Waterloo",
      text: "Travel-time estimation and digital twins for urban mobility: <a href=\"#linketa\">LinkETA</a>, <a href=\"#metaeta\">MetaETA</a>, <a href=\"#multimodal-eta\">Multimodal ETA</a>, DTUMOS, <a href=\"#text2simulation\">Text2Simulation</a>, and a <a href=\"#dementia-review\">systematic review</a> with SQUAD Lab." },
    { when: "Sep 2024 – Apr 2026", type: "Education", role: "Master of Applied Computing", org: "Wilfrid Laurier University, Waterloo",
      facts: ["GPA 10.75/12", "Award for Outstanding Graduate Work, Class of 2026",
        "Thesis: <a href=\"https://scholars.wlu.ca/etd/2908/\" target=\"_blank\" rel=\"noopener\">Intelligent Digital Twin System for Urban Mobility</a>, defended April 2026",
        "Supervisors: Dr. Sukhjit Singh Sehra and Dr. Emad A. Mohammed",
        "Coursework: Practical Algorithm Design, Data Analysis, Advanced Parallel Programming, Machine Learning"] },
    { when: "Jun 2022 – Jun 2024", type: "Industry", role: "IT Consultant", org: "Glazingshopee, Mumbai",
      text: "Led product development for FacadeMart, Buyglass24 and EdFacade, interviewed clients and end users to turn their workflows into software requirements, and coordinated a 5-person cross-functional team. <a href=\"/demos/igu-quote/\">Try the demo</a>." },
    { when: "Jul 2018 – May 2022", type: "Education", role: "B.Tech. in Computer Science and Engineering", org: "Sanjay Ghodawat University, Kolhapur",
      facts: ["GPA 8.29/10", "Final-year project: <a href=\"#fake-news\">fake news detection</a> with a hybrid BiLSTM-TCN model", "SGU Best Project Award (2021–22)"] },
    { when: "Jan – Feb 2021", type: "Internship", role: "Electronics Engineering Intern", org: "Sharp Electronics, Pune",
      text: "Wrote and flashed Embedded C and 8051 assembly programs for Nuvoton 8051 microcontrollers with a senior software developer, and followed projects from development to delivery." }
  ];

  SITE.teaching = [
    { course: "CP421 Data Mining", when: "Fall 2025, Winter 2026", role: "Graduate Teaching Assistant", count: "223", unit: "undergraduates",
      text: "A fourth-year course on mining big data: MapReduce, Bloom filters, stream counting, clustering, frequent itemsets and community detection. I held 30 hours of office hours, marked 436 assignment submissions and the reports and presentations of 57 project groups, and wrote feedback that pointed to the exact step where each student went wrong." },
    { course: "CP476 Internet Computing", when: "Winter 2025, Spring 2025", role: "Graduate Teaching Assistant", count: "190", unit: "undergraduates over two terms",
      text: "A fourth-year course on building web applications with Apache, PHP, MySQL, JavaScript, Node.js and MongoDB. I evaluated the project reports and presentations of 50 groups, built a rubric checklist for software design documents, and invigilated midterms and finals." }
  ];

  SITE.awards = [
    { value: "2026", title: "Award for Outstanding Graduate Work", text: "Wilfrid Laurier University, Class of 2026." },
    { value: "$48K", title: "Graduate funding", text: "CAD, awarded during the master's program." },
    { value: "$6K", title: "Graduate studentship", text: "CAD, awarded during the master's program." },
    { value: "2021–22", title: "SGU Best Project Award", text: "For the fake news detection paper, Sanjay Ghodawat University." }
  ];

  // Journal names are left out while the manuscripts are under review or revision (as in the CV).
  SITE.publications = [
    { group: "Journal manuscripts", items: [
      { title: "LinkETA: A Multi-Relational Graph Transformer for Link-Level Travel Time Estimation", meta: "Under revision · preprint on SSRN", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7379984" },
      { title: "MetaETA: A Meta-Learning Framework for Link-Level Travel Time Estimation", meta: "Under review" },
      { title: "Affect Recognition in Socially Assistive Robots for Dementia Care: A Systematic Review", meta: "Under review" }
    ] },
    { group: "Conference papers", items: [
      { title: "Link-Level Spatio-Temporal Travel Time Prediction for Multi-Modal Commute Trip Estimation", meta: "IEEE 12th World Forum on Internet of Things (WF-IoT) · Abu Dhabi · 2026 · to appear" },
      { title: "Text2Simulation: A Natural Language Interface for Transportation Digital Twin Systems", meta: "IEEE International Conference on Green Energy and Smart Systems (GESS) · Long Beach · 2026 · to appear" },
      { title: "Fake News Detection Using Hybrid BiLSTM-TCN Model with Attention Mechanism", meta: "ICAAIC · IEEE · Salem, India · 2023", href: "https://ieeexplore.ieee.org/document/10140491" }
    ] },
    { group: "Thesis", items: [
      { title: "Intelligent Digital Twin System for Urban Mobility", meta: "Master's thesis · Wilfrid Laurier University · 2026", href: "https://scholars.wlu.ca/etd/2908/" }
    ] }
  ];

  SITE.talks = [
    { title: "IEEE International Conference on Green Energy and Smart Systems (GESS)", place: "Long Beach, CA, USA", when: "Nov 2026" },
    { title: "IEEE 12th World Forum on Internet of Things (WF-IoT)", place: "Abu Dhabi, UAE", when: "Oct 2026" },
    { title: "Master's thesis defence", place: "Department of Physics and Computer Science, Wilfrid Laurier University", when: "Apr 2026" },
    { title: "2nd International Conference on Applied Artificial Intelligence and Computing (ICAAIC), IEEE", place: "Salem, India", when: "May 2023" }
  ];

  SITE.skills = [
    { group: "Programming", items: ["Python", "Java", "C/C++", "R"] },
    { group: "Machine learning", items: ["Transformers", "GNN", "CNN", "LSTM", "NLP", "DQN", "LLMs", "Spatiotemporal prediction", "Meta-learning", "Reinforcement learning", "Recommendation systems", "Clustering", "LangChain", "LangGraph"] },
    { group: "Maps and geospatial", items: ["OSRM", "OpenStreetMap", "Map matching", "OR-Tools", "GeoPandas", "Shapely", "Folium", "Simulation"] },
    { group: "Libraries", items: ["NumPy", "Pandas", "SciPy", "scikit-learn", "PyTorch", "TensorFlow", "Keras", "PyG", "Matplotlib", "Seaborn"] },
    { group: "Data and engineering", items: ["SQL (MySQL)", "MongoDB", "Hadoop", "Linux", "CUDA", "Airflow", "Git", "AWS", "Docker", "Jira", "Agile", "PRISMA reviews", "Unit testing", "QA testing"] }
  ];

  SITE.certifications = [
    { title: "Graduate Teaching Assistant Training: Best Practices in Teaching", by: "Wilfrid Laurier University", when: "Jan 2025" },
    { title: "AODA Integrated Accessibility Training", by: "Wilfrid Laurier University", when: "Jan 2025" },
    { title: "Planning a Literature Review, ASPIRE Workshop", by: "Wilfrid Laurier University Library", when: "Dec 2024" },
    { title: "Python for Data Science, Elite certificate", by: "NPTEL, IIT Madras", when: "Aug 2022" },
    { title: "Programming in Java, score 95%", by: "NPTEL, IIT Kharagpur", when: "Apr 2020" }
  ];

  SITE.languages = ["English (IELTS 8 of 9)", "Hindi", "Marathi", "Urdu"];

  SITE.affiliations = [
    { title: "Canadian Artificial Intelligence Association (CAIAC)", when: "Member since 2026" },
    { title: "ML Collective (MLC)", when: "Member since 2026" }
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
  /* e:\Projects\Resume\mubarak.sh\photos-to-add\ and run                */
  /*   python portfolio/scripts/add-photos.py                            */
  /* It strips location/camera data, fixes rotation, makes web-sized    */
  /* copies in assets/photos/ and adds them to the top of the list      */
  /* below. Then fill in alt (what the photo shows, for screen readers),*/
  /* title, place and note. The page shows a fresh colour-balanced mix  */
  /* on every visit (views.js), so the order of this list doesn't matter.*/
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
    {"id": "photo-088", "src": "assets/photos/photo-088.jpg", "thumb": "assets/photos/photo-088-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [44, 0.16, 0.05], "alt": "A street lamp glowing through bare branches against a black night sky, with a long streak of lens flare.", "title": "Night glow", "place": "", "year": "2026", "note": ""},
    {"id": "photo-032", "src": "assets/photos/photo-032.jpg", "thumb": "assets/photos/photo-032-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [353, 0.54, 0.55], "alt": "A tree in deep red autumn leaves, its fallen leaves carpeting the ground beneath.", "title": "Crimson", "place": "", "year": "2026", "note": ""},
    {"id": "photo-033", "src": "assets/photos/photo-033.jpg", "thumb": "assets/photos/photo-033-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [44, 0.68, 0.11], "alt": "A dark, rain-streaked window reflecting a hand holding up a phone.", "title": "Rain on glass", "place": "", "year": "2026", "note": ""},
    {"id": "photo-034", "src": "assets/photos/photo-034.jpg", "thumb": "assets/photos/photo-034-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [345, 0.45, 0.52], "alt": "A library atrium with curved white balconies and a skylight, seen past a laptop screen and a coffee cup.", "title": "Reading room", "place": "", "year": "2026", "note": ""},
    {"id": "photo-001", "src": "assets/photos/photo-001.jpg", "thumb": "assets/photos/photo-001-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [31, 0.69, 0.61], "alt": "Looking straight up into maple trees in full autumn colour, orange on the left and yellow on the right, with a dark trunk cutting across.", "title": "Maple canopy", "place": "", "year": "2026", "note": ""},
    {"id": "photo-036", "src": "assets/photos/photo-036.jpg", "thumb": "assets/photos/photo-036-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [66, 0.43, 0.06], "alt": "A bright full moon behind thin, dark clouds.", "title": "Moon in the clouds", "place": "", "year": "2026", "note": ""},
    {"id": "photo-037", "src": "assets/photos/photo-037.jpg", "thumb": "assets/photos/photo-037-sm.jpg", "w": 1782, "h": 1683, "tw": 720, "ratio": "18 / 17", "tone": [134, 0.19, 0.71], "alt": "Four gulls on a rooftop ledge beside a large full moon rising in a pale sky.", "title": "Moonguards", "place": "", "year": "2026", "note": ""},
    {"id": "photo-038", "src": "assets/photos/photo-038.jpg", "thumb": "assets/photos/photo-038-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [19, 0.89, 0.28], "alt": "An orange sunset behind silhouetted power lines and a transmission tower.", "title": "Sunset on the grid", "place": "", "year": "2026", "note": ""},
    {"id": "photo-039", "src": "assets/photos/photo-039.jpg", "thumb": "assets/photos/photo-039-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [25, 0.58, 0.4], "alt": "An old-fashioned street lamp glowing among red autumn leaves, crossed by a ray of sunlight.", "title": "Lamplight", "place": "", "year": "2026", "note": ""},
    {"id": "photo-002", "src": "assets/photos/photo-002.jpg", "thumb": "assets/photos/photo-002-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [17, 0.35, 0.54], "alt": "Maple branches seen from below, the leaves turning from green to deep crimson.", "title": "Turning red", "place": "", "year": "2026", "note": ""},
    {"id": "photo-040", "src": "assets/photos/photo-040.jpg", "thumb": "assets/photos/photo-040-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [35, 0.35, 0.7], "alt": "A plated dessert dusted with cinnamon and drizzled with chocolate, on a wooden table, seen from above.", "title": "Something sweet", "place": "", "year": "2026", "note": ""},
    {"id": "photo-003", "src": "assets/photos/photo-003.jpg", "thumb": "assets/photos/photo-003-sm.jpg", "w": 1751, "h": 1713, "tw": 720, "ratio": "1751 / 1713", "tone": [63, 0.34, 0.47], "alt": "A large tree shading an empty picnic table on a lawn scattered with fallen leaves, with red and yellow trees beyond.", "title": "Picnic table", "place": "", "year": "2026", "note": ""},
    {"id": "photo-004", "src": "assets/photos/photo-004.jpg", "thumb": "assets/photos/photo-004-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [27, 0.48, 0.71], "alt": "A tall maple beside a street, turning red and orange from the top down against a clear blue sky, its fallen leaves on the grass.", "title": "Street maple", "place": "", "year": "2026", "note": ""},
    {"id": "photo-006", "src": "assets/photos/photo-006.jpg", "thumb": "assets/photos/photo-006-sm.jpg", "w": 1533, "h": 1957, "tw": 720, "ratio": "1533 / 1957", "tone": [29, 0.35, 0.63], "alt": "A cluster of red pompon dahlias, some still in bud, growing tall in a sunny garden.", "title": "Dahlias", "place": "", "year": "2026", "note": ""},
    {"id": "photo-007", "src": "assets/photos/photo-007.jpg", "thumb": "assets/photos/photo-007-sm.jpg", "w": 1896, "h": 1582, "tw": 720, "ratio": "948 / 791", "tone": [339, 0.35, 0.55], "alt": "A sky full of small rippled clouds lit gold and orange by the setting sun, with a single streetlight at the bottom.", "title": "Mackerel sky", "place": "", "year": "2026", "note": ""},
    {"id": "photo-008", "src": "assets/photos/photo-008.jpg", "thumb": "assets/photos/photo-008-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [56, 0.35, 0.5], "alt": "A blue and white floral mug on a sunlit wooden picnic table, with green trees behind.", "title": "Morning mug", "place": "", "year": "2026", "note": ""},
    {"id": "photo-041", "src": "assets/photos/photo-041.jpg", "thumb": "assets/photos/photo-041-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [27, 0.73, 0.57], "alt": "Orange and yellow maple leaves around a dark trunk, lit by the sun.", "title": "October maple", "place": "", "year": "2026", "note": ""},
    {"id": "photo-043", "src": "assets/photos/photo-043.jpg", "thumb": "assets/photos/photo-043-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [35, 0.2, 0.55], "alt": "A long, narrow aisle between tall library shelves full of books.", "title": "The stacks", "place": "", "year": "2026", "note": ""},
    {"id": "photo-009", "src": "assets/photos/photo-009.jpg", "thumb": "assets/photos/photo-009-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [67, 0.23, 0.73], "alt": "A Canada goose standing on grass, looking toward the camera, with a road and trees behind it.", "title": "Canada goose", "place": "", "year": "2026", "note": ""},
    {"id": "photo-010", "src": "assets/photos/photo-010.jpg", "thumb": "assets/photos/photo-010-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [73, 0.15, 0.65], "alt": "A busy downtown street with traffic lights, a glass pedestrian bridge and tall buildings, including an ornate stone tower on the right.", "title": "Downtown", "place": "", "year": "2026", "note": ""},
    {"id": "photo-044", "src": "assets/photos/photo-044.jpg", "thumb": "assets/photos/photo-044-sm.jpg", "w": 1491, "h": 2013, "tw": 720, "ratio": "497 / 671", "tone": [45, 0.43, 0.5], "alt": "A polished slice of a pallasite meteorite, golden olivine crystals set in metal, lit in a museum case.", "title": "Pallasite meteorite", "place": "", "year": "2026", "note": ""},
    {"id": "photo-046", "src": "assets/photos/photo-046.jpg", "thumb": "assets/photos/photo-046-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [88, 0.25, 0.37], "alt": "Two garden chairs in the shade of a large tree beside a chain-link fence, with sunlight through the leaves.", "title": "Two chairs", "place": "", "year": "2026", "note": ""},
    {"id": "photo-047", "src": "assets/photos/photo-047.jpg", "thumb": "assets/photos/photo-047-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [37, 0.47, 0.58], "alt": "A pan of rice noodles with spinach, shrimp, corn and peppers on the stove.", "title": "Home cooking", "place": "", "year": "2026", "note": ""},
    {"id": "photo-048", "src": "assets/photos/photo-048.jpg", "thumb": "assets/photos/photo-048-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [69, 0.39, 0.52], "alt": "A calm river reflecting the green trees that overhang its banks.", "title": "Pristine waters", "place": "", "year": "2026", "note": ""},
    {"id": "photo-049", "src": "assets/photos/photo-049.jpg", "thumb": "assets/photos/photo-049-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [40, 0.29, 0.06], "alt": "Stars over three silhouetted trees, with a faint glow along the horizon.", "title": "Before dawn", "place": "", "year": "2026", "note": ""},
    {"id": "photo-051", "src": "assets/photos/photo-051.jpg", "thumb": "assets/photos/photo-051-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [34, 0.11, 0.02], "alt": "Faint stars across a dark night sky.", "title": "Stargazing", "place": "", "year": "2026", "note": ""},
    {"id": "photo-011", "src": "assets/photos/photo-011.jpg", "thumb": "assets/photos/photo-011-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [127, 0.32, 0.51], "alt": "A modern glass building across a pond, seen through overhanging branches above a green lawn and footpath.", "title": "Symbol of PI", "place": "", "year": "2026", "note": ""},
    {"id": "photo-052", "src": "assets/photos/photo-052.jpg", "thumb": "assets/photos/photo-052-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [89, 0.32, 0.63], "alt": "Two grey squirrels in tall grass at the foot of a tree, one looking at the camera.", "title": "Two squirrels", "place": "", "year": "2026", "note": ""},
    {"id": "photo-053", "src": "assets/photos/photo-053.jpg", "thumb": "assets/photos/photo-053-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [44, 0.13, 0.63], "alt": "A shelf of painted Star Wars miniature figures, with white-armoured troopers in front.", "title": "Figurines", "place": "", "year": "2026", "note": ""},
    {"id": "photo-054", "src": "assets/photos/photo-054.jpg", "thumb": "assets/photos/photo-054-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [40, 0.02, 0.03], "alt": "A full moon glowing pale gold against a black sky.", "title": "Gold moon", "place": "", "year": "2026", "note": ""},
    {"id": "photo-055", "src": "assets/photos/photo-055.jpg", "thumb": "assets/photos/photo-055-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [45, 0.11, 0.57], "alt": "A striped garter snake crossing grey asphalt.", "title": "Crossing", "place": "", "year": "2026", "note": ""},
    {"id": "photo-056", "src": "assets/photos/photo-056.jpg", "thumb": "assets/photos/photo-056-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [70, 0.34, 0.61], "alt": "Marigolds and purple salvia in front of a Wilfrid Laurier University sign and a concrete building.", "title": "Laurier in bloom", "place": "", "year": "2026", "note": ""},
    {"id": "photo-057", "src": "assets/photos/photo-057.jpg", "thumb": "assets/photos/photo-057-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [52, 0.25, 0.06], "alt": "A Tim Hortons sign glowing against a black night sky above the lit restaurant.", "title": "Always fresh", "place": "", "year": "2026", "note": ""},
    {"id": "photo-012", "src": "assets/photos/photo-012.jpg", "thumb": "assets/photos/photo-012-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [315, 0.37, 0.56], "alt": "A tall cumulus cloud glowing orange and pink at sunset against a purple-blue sky.", "title": "Sunset cumulus", "place": "", "year": "2026", "note": ""},
    {"id": "photo-013", "src": "assets/photos/photo-013.jpg", "thumb": "assets/photos/photo-013-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [210, 0.55, 0.67], "alt": "A passenger jet crossing a clear blue sky.", "title": "Passing over", "place": "", "year": "2026", "note": ""},
    {"id": "photo-058", "src": "assets/photos/photo-058.jpg", "thumb": "assets/photos/photo-058-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [52, 0.65, 0.6], "alt": "A cluster of yellow black-eyed Susan flowers in green grass.", "title": "Black-eyed Susans", "place": "", "year": "2026", "note": ""},
    {"id": "photo-062", "src": "assets/photos/photo-062.jpg", "thumb": "assets/photos/photo-062-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [50, 0.39, 0.12], "alt": "Lit buildings and the moon reflected in a still pond at night.", "title": "Moonshine", "place": "", "year": "2026", "note": ""},
    {"id": "photo-015", "src": "assets/photos/photo-015.jpg", "thumb": "assets/photos/photo-015-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [137, 0.25, 0.58], "alt": "A long, straight small-town main street dipping downhill and rising on the far side, lined with shops, parked cars and trees.", "title": "Main street", "place": "", "year": "2026", "note": ""},
    {"id": "photo-063", "src": "assets/photos/photo-063.jpg", "thumb": "assets/photos/photo-063-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [57, 0.23, 0.74], "alt": "A white water lily among green and purple lily pads on a pond.", "title": "Water lily", "place": "", "year": "2026", "note": ""},
    {"id": "photo-016", "src": "assets/photos/photo-016.jpg", "thumb": "assets/photos/photo-016-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [181, 0.23, 0.78], "alt": "A man in a hat walking a golden retriever along a sandy beach, with sunlit water stretching to the horizon.", "title": "Forever friend", "place": "", "year": "2026", "note": ""},
    {"id": "photo-017", "src": "assets/photos/photo-017.jpg", "thumb": "assets/photos/photo-017-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [204, 0.46, 0.6], "alt": "Shallow rapids running over a rocky riverbed under a deep blue sky, with forest on the far bank.", "title": "Rapids", "place": "", "year": "2026", "note": ""},
    {"id": "photo-064", "src": "assets/photos/photo-064.jpg", "thumb": "assets/photos/photo-064-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [80, 0.59, 0.38], "alt": "A narrow dirt path through a sunlit green forest.", "title": "Forest path", "place": "", "year": "2026", "note": ""},
    {"id": "photo-066", "src": "assets/photos/photo-066.jpg", "thumb": "assets/photos/photo-066-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [345, 0.33, 0.5], "alt": "A man standing at the edge of a lake, watching pink and orange sunset clouds reflected in the water.", "title": "Watching the sunset", "place": "", "year": "2026", "note": ""},
    {"id": "photo-018", "src": "assets/photos/photo-018.jpg", "thumb": "assets/photos/photo-018-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [75, 0.52, 0.48], "alt": "A white folding garden chair on bright green grass beside a weathered wooden fence.", "title": "Lonely chair", "place": "", "year": "2026", "note": ""},
    {"id": "photo-068", "src": "assets/photos/photo-068.jpg", "thumb": "assets/photos/photo-068-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [84, 0.33, 0.62], "alt": "A female mallard duck standing on green grass.", "title": "Mallard", "place": "", "year": "2026", "note": ""},
    {"id": "photo-069", "src": "assets/photos/photo-069.jpg", "thumb": "assets/photos/photo-069-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [130, 0.4, 0.51], "alt": "A wide green lawn framed by pine branches and leafy trees under a blue sky.", "title": "Open lawn", "place": "", "year": "2026", "note": ""},
    {"id": "photo-019", "src": "assets/photos/photo-019.jpg", "thumb": "assets/photos/photo-019-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [212, 0.29, 0.7], "alt": "A misty lake with a single waterbird on still water and a tree-lined shore fading into the fog.", "title": "Fog", "place": "", "year": "2026", "note": ""},
    {"id": "photo-070", "src": "assets/photos/photo-070.jpg", "thumb": "assets/photos/photo-070-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [91, 0.47, 0.56], "alt": "A white swan gliding on a green pond, reflected in the water.", "title": "Swan", "place": "", "year": "2026", "note": ""},
    {"id": "photo-072", "src": "assets/photos/photo-072.jpg", "thumb": "assets/photos/photo-072-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [67, 0.34, 0.68], "alt": "Canada geese leading a line of fluffy goslings across a lawn, with a footbridge behind.", "title": "The march", "place": "", "year": "2026", "note": ""},
    {"id": "photo-073", "src": "assets/photos/photo-073.jpg", "thumb": "assets/photos/photo-073-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [213, 0.32, 0.39], "alt": "A thin crescent moon in a deep blue evening sky above dark trees.", "title": "Crescent at dusk", "place": "", "year": "2026", "note": ""},
    {"id": "photo-074", "src": "assets/photos/photo-074.jpg", "thumb": "assets/photos/photo-074-sm.jpg", "w": 1732, "h": 1732, "tw": 720, "ratio": "1 / 1", "tone": [239, 0.68, 0.69], "alt": "Toronto City Hall's two curved towers lit purple at night behind a large Christmas tree.", "title": "City Hall at Christmas", "place": "Toronto", "year": "2025", "note": ""},
    {"id": "photo-076", "src": "assets/photos/photo-076.jpg", "thumb": "assets/photos/photo-076-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [33, 0.4, 0.49], "alt": "A cuttlefish close up in an aquarium tank, its patterned skin catching the light.", "title": "Close encounter", "place": "", "year": "2025", "note": ""},
    {"id": "photo-020", "src": "assets/photos/photo-020.jpg", "thumb": "assets/photos/photo-020-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [215, 0.7, 0.65], "alt": "A dense school of silver fish swirling through blue aquarium water.", "title": "School of fish", "place": "", "year": "2025", "note": ""},
    {"id": "photo-021", "src": "assets/photos/photo-021.jpg", "thumb": "assets/photos/photo-021-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [214, 0.46, 0.54], "alt": "The CN Tower rising between glass towers, seen from a downtown street.", "title": "CN Tower", "place": "Toronto", "year": "2025", "note": ""},
    {"id": "photo-022", "src": "assets/photos/photo-022.jpg", "thumb": "assets/photos/photo-022-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [210, 0.39, 0.63], "alt": "The CN Tower beside a curved glass skyscraper and an older stone building with columns, under a sky of scattered clouds.", "title": "Old and new", "place": "Toronto", "year": "2025", "note": ""},
    {"id": "photo-077", "src": "assets/photos/photo-077.jpg", "thumb": "assets/photos/photo-077-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [41, 0.51, 0.31], "alt": "Picnic tables under tall trees in a park, the ground covered with fallen leaves.", "title": "Autumn picnic", "place": "", "year": "2025", "note": ""},
    {"id": "photo-078", "src": "assets/photos/photo-078.jpg", "thumb": "assets/photos/photo-078-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [21, 0.38, 0.7], "alt": "A bronze statue on a stone base in a circle of flowers, with red and yellow autumn trees behind.", "title": "Veterans' Green", "place": "", "year": "2025", "note": ""},
    {"id": "photo-023", "src": "assets/photos/photo-023.jpg", "thumb": "assets/photos/photo-023-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [219, 0.64, 0.07], "alt": "A thin crescent moon with a bright planet beside it in a dark blue sky, above silhouetted trees.", "title": "Before sunrise", "place": "", "year": "2025", "note": ""},
    {"id": "photo-025", "src": "assets/photos/photo-025.jpg", "thumb": "assets/photos/photo-025-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [31, 0.57, 0.53], "alt": "The sun dipping behind silhouetted trees, under a wide sky of golden and grey clouds.", "title": "Last light", "place": "", "year": "2025", "note": ""},
    {"id": "photo-026", "src": "assets/photos/photo-026.jpg", "thumb": "assets/photos/photo-026-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [14, 0.03, 0.01], "alt": "A half moon glowing deep orange in a black night sky.", "title": "Blood Moon", "place": "", "year": "2025", "note": ""},
    {"id": "photo-027", "src": "assets/photos/photo-027.jpg", "thumb": "assets/photos/photo-027-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [337, 0.38, 0.48], "alt": "A thin crescent moon in a patch of deep blue sky, framed by clouds lit pink and gold.", "title": "Crescent", "place": "", "year": "2025", "note": ""},
    {"id": "photo-028", "src": "assets/photos/photo-028.jpg", "thumb": "assets/photos/photo-028-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [68, 0.46, 0.65], "alt": "A grey squirrel sitting upright at the base of a tree trunk, its tail curled up behind it, in tall green grass.", "title": "Watchful", "place": "", "year": "2025", "note": ""},
    {"id": "photo-029", "src": "assets/photos/photo-029.jpg", "thumb": "assets/photos/photo-029-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [37, 0.61, 0.44], "alt": "The sun setting over a lake, framed by dark tree branches, its reflection on the water and a small building on the shore.", "title": "Lakeside sunset", "place": "", "year": "2025", "note": ""},
    {"id": "photo-030", "src": "assets/photos/photo-030.jpg", "thumb": "assets/photos/photo-030-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [65, 0.58, 0.57], "alt": "Canada geese grazing on a wide lawn in warm evening light, one in the foreground, with tall evergreens behind.", "title": "Grazing geese", "place": "", "year": "2025", "note": ""},
    {"id": "photo-031", "src": "assets/photos/photo-031.jpg", "thumb": "assets/photos/photo-031-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [214, 0.28, 0.52], "alt": "A wide, calm river between wooded banks under a blue sky with puffy white clouds.", "title": "Riverbend", "place": "", "year": "2025", "note": ""},
    {"id": "photo-089", "src": "assets/photos/photo-089.jpg", "thumb": "assets/photos/photo-089-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [1, 0.87, 0.47], "alt": "The sun setting low in a deep red sky, framed by silhouetted leaves.", "title": "Red sun", "place": "", "year": "2025", "note": ""},
    {"id": "photo-090", "src": "assets/photos/photo-090.jpg", "thumb": "assets/photos/photo-090-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [32, 0.57, 0.23], "alt": "A curving road at night under an orange street lamp, with trees and a lit building beyond.", "title": "Night road", "place": "", "year": "2025", "note": ""},
    {"id": "photo-091", "src": "assets/photos/photo-091.jpg", "thumb": "assets/photos/photo-091-sm.jpg", "w": 1299, "h": 2309, "tw": 720, "ratio": "1299 / 2309", "tone": [80, 0.36, 0.42], "alt": "A straight gravel trail running through a tunnel of green trees.", "title": "Green tunnel", "place": "", "year": "2025", "note": ""},
    {"id": "photo-092", "src": "assets/photos/photo-092.jpg", "thumb": "assets/photos/photo-092-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [358, 0.5, 0.35], "alt": "A red and orange sunset sky behind silhouetted trees, flagpoles with a Canadian flag, and power lines.", "title": "Flags at sunset", "place": "", "year": "2025", "note": ""},
    {"id": "photo-093", "src": "assets/photos/photo-093.jpg", "thumb": "assets/photos/photo-093-sm.jpg", "w": 1299, "h": 2310, "tw": 720, "ratio": "433 / 770", "tone": [239, 0.89, 0.08], "alt": "The dark inside of a night bus, with yellow handrails and a glowing Next Stop sign.", "title": "Next stop", "place": "", "year": "2025", "note": ""},
    {"id": "photo-094", "src": "assets/photos/photo-094.jpg", "thumb": "assets/photos/photo-094-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [52, 0.24, 0.59], "alt": "A cream and white cat resting a paw on a ledge and gazing to the side.", "title": "Daydream", "place": "", "year": "2025", "note": ""},
    {"id": "photo-095", "src": "assets/photos/photo-095.jpg", "thumb": "assets/photos/photo-095-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [25, 0.59, 0.59], "alt": "A low building at sunset seen through a window, with an orange streak of reflected light across the glass and a pale sun in the haze.", "title": "Through the window", "place": "", "year": "2025", "note": ""},
    {"id": "photo-096", "src": "assets/photos/photo-096.jpg", "thumb": "assets/photos/photo-096-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [352, 0.61, 0.52], "alt": "Fire trucks with flashing red and blue lights lined up along a street at dusk, a firefighter standing beside them.", "title": "Red lights", "place": "", "year": "2025", "note": ""},
    {"id": "photo-097", "src": "assets/photos/photo-097.jpg", "thumb": "assets/photos/photo-097-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [205, 0.41, 0.34], "alt": "Dark storm clouds lit orange and gold at their edges above silhouetted bare trees.", "title": "Storm light", "place": "", "year": "2025", "note": ""},
    {"id": "photo-098", "src": "assets/photos/photo-098.jpg", "thumb": "assets/photos/photo-098-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [37, 0.39, 0.35], "alt": "A band of golden sunset light breaking through dark clouds above evergreens and a campus building.", "title": "Golden break", "place": "", "year": "2025", "note": ""},
    {"id": "photo-099", "src": "assets/photos/photo-099.jpg", "thumb": "assets/photos/photo-099-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [298, 0.81, 0.02], "alt": "A full moon, faintly golden, alone in a black sky.", "title": "Full moon", "place": "", "year": "2025", "note": ""},
    {"id": "photo-100", "src": "assets/photos/photo-100.jpg", "thumb": "assets/photos/photo-100-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [5, 0.18, 0.61], "alt": "A Canada goose walking across a thin layer of snow in front of a red brick building as snowflakes fall.", "title": "Spring snow", "place": "", "year": "2025", "note": ""},
    {"id": "photo-101", "src": "assets/photos/photo-101.jpg", "thumb": "assets/photos/photo-101-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [22, 0.13, 0.64], "alt": "A crowd in green hats filling the street in front of a brick apartment building on St. Patrick's Day.", "title": "Sea of green", "place": "", "year": "2025", "note": ""},
    {"id": "photo-102", "src": "assets/photos/photo-102.jpg", "thumb": "assets/photos/photo-102-sm.jpg", "w": 2000, "h": 1500, "tw": 720, "ratio": "4 / 3", "tone": [210, 0.27, 0.69], "alt": "Tall glass towers and a low building under a clear blue sky, with snowbanks and a lone walker in front.", "title": "Towers", "place": "", "year": "2025", "note": ""},
    {"id": "photo-082", "src": "assets/photos/photo-082.jpg", "thumb": "assets/photos/photo-082-sm.jpg", "w": 1206, "h": 2144, "tw": 720, "ratio": "9 / 16", "tone": [335, 0.26, 0.54], "alt": "A Canada goose standing on a snowbank beside a tree trunk at sunset.", "title": "Goose in the snow", "place": "", "year": "2025", "note": ""},
    {"id": "photo-103", "src": "assets/photos/photo-103.jpg", "thumb": "assets/photos/photo-103-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [32, 0.52, 0.52], "alt": "A frozen coffee drink with a straw in a Tim Hortons cup on a café table.", "title": "Coffee break", "place": "", "year": "2025", "note": ""},
    {"id": "photo-104", "src": "assets/photos/photo-104.jpg", "thumb": "assets/photos/photo-104-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [213, 0.29, 0.73], "alt": "Cars buried in deep snow in a parking lot after a storm, with office buildings under a clear blue sky.", "title": "Snowed in", "place": "", "year": "2025", "note": ""},
    {"id": "photo-105", "src": "assets/photos/photo-105.jpg", "thumb": "assets/photos/photo-105-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [40, 0.17, 0.65], "alt": "Snow falling at night under bright parking-lot lamps, the cars below covered in white.", "title": "Snowfall", "place": "", "year": "2025", "note": ""},
    {"id": "photo-106", "src": "assets/photos/photo-106.jpg", "thumb": "assets/photos/photo-106-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [30, 0.37, 0.23], "alt": "Smoke rising from a tall chimney against a dim sunset sky, above a dark snowy roofline.", "title": "Smokestack", "place": "", "year": "2025", "note": ""},
    {"id": "photo-107", "src": "assets/photos/photo-107.jpg", "thumb": "assets/photos/photo-107-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [46, 0.26, 0.56], "alt": "The front of an old building in red brick and cream stone, with tall windows and a small balcony.", "title": "Brick and stone", "place": "", "year": "2025", "note": ""},
    {"id": "photo-108", "src": "assets/photos/photo-108.jpg", "thumb": "assets/photos/photo-108-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [212, 0.4, 0.69], "alt": "A bronze statue of a soldier holding a rifle, on a granite pedestal against a clear blue sky.", "title": "On guard", "place": "", "year": "2025", "note": ""},
    {"id": "photo-109", "src": "assets/photos/photo-109.jpg", "thumb": "assets/photos/photo-109-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [204, 0.69, 0.31], "alt": "A rock guitarist in a school-uniform costume playing on stage under green and teal lights.", "title": "Live on stage", "place": "", "year": "2024", "note": ""},
    {"id": "photo-084", "src": "assets/photos/photo-084.jpg", "thumb": "assets/photos/photo-084-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [25, 0.2, 0.49], "alt": "A white and orange cat peering over the edge of a desk.", "title": "Curiosity", "place": "", "year": "2024", "note": ""},
    {"id": "photo-110", "src": "assets/photos/photo-110.jpg", "thumb": "assets/photos/photo-110-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [154, 0.42, 0.31], "alt": "Glowing wire reindeer standing in the snow in front of a brick building strung with white holiday lights.", "title": "Reindeer lights", "place": "", "year": "2024", "note": ""},
    {"id": "photo-111", "src": "assets/photos/photo-111.jpg", "thumb": "assets/photos/photo-111-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [26, 0.46, 0.33], "alt": "People skating on an outdoor rink at night, with string lights, flags and a lit Christmas tree at the far end.", "title": "Night skate", "place": "", "year": "2024", "note": ""},
    {"id": "photo-085", "src": "assets/photos/photo-085.jpg", "thumb": "assets/photos/photo-085-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [214, 0.68, 0.78], "alt": "A flock of birds scattered across a clear blue sky.", "title": "Flock", "place": "", "year": "2024", "note": ""},
    {"id": "photo-112", "src": "assets/photos/photo-112.jpg", "thumb": "assets/photos/photo-112-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [246, 0.3, 0.49], "alt": "A bare tree silhouetted against a purple and orange dusk sky above a dark river.", "title": "Dusk by the river", "place": "", "year": "2024", "note": ""},
    {"id": "photo-113", "src": "assets/photos/photo-113.jpg", "thumb": "assets/photos/photo-113-sm.jpg", "w": 2309, "h": 1299, "tw": 720, "ratio": "2309 / 1299", "tone": [41, 0.27, 0.6], "alt": "A wide, shallow river at golden hour, with houses along the far bank under a clear evening sky.", "title": "Evening river", "place": "", "year": "2024", "note": ""},
    {"id": "photo-114", "src": "assets/photos/photo-114.jpg", "thumb": "assets/photos/photo-114-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [31, 0.34, 0.18], "alt": "An old-style street lamp glowing among bare branches in the blue dusk.", "title": "Lamppost", "place": "", "year": "2024", "note": ""},
    {"id": "photo-115", "src": "assets/photos/photo-115.jpg", "thumb": "assets/photos/photo-115-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [330, 0.44, 0.57], "alt": "A pink and purple sky over a river valley, with a red autumn tree, a footpath and power lines.", "title": "Pink evening", "place": "", "year": "2024", "note": ""},
    {"id": "photo-116", "src": "assets/photos/photo-116.jpg", "thumb": "assets/photos/photo-116-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [33, 0.36, 0.69], "alt": "A young spotted deer resting on sandy ground, head turned to the side.", "title": "Fawn", "place": "", "year": "2024", "note": ""},
    {"id": "photo-117", "src": "assets/photos/photo-117.jpg", "thumb": "assets/photos/photo-117-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [43, 0.28, 0.54], "alt": "A grey crowned crane with its golden crest, standing among fallen autumn leaves.", "title": "Crowned crane", "place": "", "year": "2024", "note": ""},
    {"id": "photo-086", "src": "assets/photos/photo-086.jpg", "thumb": "assets/photos/photo-086-sm.jpg", "w": 1500, "h": 2000, "tw": 720, "ratio": "3 / 4", "tone": [24, 0.38, 0.52], "alt": "Looking up into a tree with red, orange and green leaves against a blue sky.", "title": "Turning", "place": "", "year": "2024", "note": ""},
    {"id": "photo-087", "src": "assets/photos/photo-087.jpg", "thumb": "assets/photos/photo-087-sm.jpg", "w": 1301, "h": 2307, "tw": 720, "ratio": "1301 / 2307", "tone": [45, 0.06, 0.51], "alt": "The silhouette of a person standing against a pale sky, seen from below.", "title": "Silhouette", "place": "", "year": "2022", "note": ""},
    {"id": "photo-118", "src": "assets/photos/photo-118.jpg", "thumb": "assets/photos/photo-118-sm.jpg", "w": 1206, "h": 2144, "tw": 720, "ratio": "9 / 16", "tone": [40, 0.28, 0.69], "alt": "A snowy street in soft blue light, with a bright beam of light streaking across the sky.", "title": "Winter glare", "place": "", "year": "", "note": ""},
    {"id": "photo-119", "src": "assets/photos/photo-119.jpg", "thumb": "assets/photos/photo-119-sm.jpg", "w": 1206, "h": 2144, "tw": 720, "ratio": "9 / 16", "tone": [203, 0.29, 0.67], "alt": "A matte-black vintage hot rod with an exposed engine, parked on a street in front of a concrete office building.", "title": "Hot rod", "place": "", "year": "", "note": ""}
  ];
  // PHOTOS-END
})(typeof window !== "undefined" ? window : globalThis);
