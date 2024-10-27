// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

// User slice
const initialUserState = {
  user: {
    localUserId: "",
    localUsername: "",
    displayName: "",
    profileColour: "",
    credits: 0,
    role: ""
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    loginUser: (state, action) => {
      state.user.localUserId = action.payload.localUserId;
      state.user.localUsername = action.payload.localUsername;
      state.user.displayName = action.payload.displayName;
      state.user.profileColour = action.payload.profileColour;
      state.user.credits = action.payload.credits;
      state.user.role = action.payload.role;
    },

    logoutUser: (state) => {
      state.user.localUserId = "";
      state.user.localUsername = "";
      state.user.displayName = "";
      state.user.profileColour = "";
      state.user.credits = 0;
      state.user.role = "";
    },

    updateCredits: (state, action) => {
      state.user.credits = action.payload.credits;
    },
  },
});



// Prompt slice
const initialPromptState = {
  isPromptShown: false,
};

const promptSlice = createSlice({
  name: 'prompt',
  initialState: initialPromptState,
  reducers: {
    setPromptShown: (state, action) => {
      state.isPromptShown = action.payload;
    },
  },
});




// Contact slice
const initialContactState = {
  isContactShown: false,
};

const contactSlice = createSlice({
  name: 'contact',
  initialState: initialContactState,
  reducers: {
    setContactShown: (state, action) => {
      state.isContactShown = action.payload;
    },
  },
});




// Comment slice (it will be used to tell if the comment tab is shown or not)
const initialCommentState = {
  isCommentShown: false,
};

const commentSlice = createSlice({
  name: 'comment',
  initialState: initialCommentState,
  reducers: {
    setCommentShown: (state, action) => {
      state.isCommentShown = action.payload;
    },
  },
});


// Search slice (it will be used to tell if the search tab is shown or not)
const initialSearchState = {
  isSearchShown: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState: initialSearchState,
  reducers: {
    setSearchShown: (state, action) => {
      state.isSearchShown = action.payload;
    },
  },
});


const lastChatIndexSlice = createSlice({
  name: 'lastChatIndex',
  initialState: { 
    value: 0,  // Last chat index
    redirect: false  // whether or not the chatIndex was redirected or not
  },
  reducers: {
    setLastChatIndex: (state, action) => {
      state.value = action.payload.value; 
    },

    setRedirect: (state, action) => { // it might be completely unnecessary
      state.redirect = action.payload; 
    }
  },
});


// followers / following tab (it will be used to open the followers/following tab)
const initialFollowState = {
  isFollowShown: false,
};

const followSlice = createSlice({
  name: 'follow',
  initialState: initialFollowState,
  reducers: {
    setFollowShown: (state, action) => {
      state.isFollowShown = action.payload;
    },
  },
});


// settingsTab slice (it will be used to open the settings tab)
const initialSettingsTabState = {
  isSettingsTabShown: false,
};

const settingsTabSlice = createSlice({
  name: 'settingsTab',
  initialState: initialSettingsTabState,
  reducers: {
    setSettingsTabShown: (state, action) => {
      state.isSettingsTabShown = action.payload;
    },
  },
});



// report slice (it will be used to tell if the report tab is shown or not)
const initialReportState = {
  isReportShown: false,
};

const reportSlice = createSlice({
  name: 'report',
  initialState: initialReportState,
  reducers: {
    setReportShown: (state, action) => {
      state.isReportShown = action.payload;
    },
  },
});



// Sponsor slice (it will be used to tell if the sponsor tab is shown or not)
const initialSponsorState = {
  isSponsorShown: false,
};

const sponsorSlice = createSlice({
  name: 'sponsor',
  initialState: initialSponsorState,
  reducers: {
    setSponsorShown: (state, action) => {
      state.isSponsorShown = action.payload;
    },
  },
});


// Extract actions to use in components
export const { loginUser, logoutUser, updateCredits } = userSlice.actions;
export const { setPromptShown } = promptSlice.actions;
export const { setContactShown } = contactSlice.actions;
export const { setCommentShown } = commentSlice.actions;
export const { setSearchShown } = searchSlice.actions;
export const { setLastChatIndex, setRedirect } = lastChatIndexSlice.actions;
export const { setFollowShown } = followSlice.actions;
export const { setSettingsTabShown } = settingsTabSlice.actions;
export const { setReportShown } = reportSlice.actions;
export const { setSponsorShown } = sponsorSlice.actions;

// Create store using configureStore with combined reducers
const store = configureStore({
  reducer: {
    user: userSlice.reducer, // User reducer
    prompt: promptSlice.reducer, // Prompt reducer
    contact: contactSlice.reducer, // Contact reducer
    comment: commentSlice.reducer, // Comment reducer
    search: searchSlice.reducer, // Search reducer
    lastChatIndex: lastChatIndexSlice.reducer, // Last chat index reducer
    follow: followSlice.reducer, // Follow reducer
    settingsTab: settingsTabSlice.reducer, // Settings tab reducer
    report: reportSlice.reducer, // Report reducer
    sponsor: sponsorSlice.reducer, // Sponsor reducer
  },
});

export default store;
