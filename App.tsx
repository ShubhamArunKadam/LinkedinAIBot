
import React, { useState, useCallback } from 'react';
import { TrendIcon, PostIcon, ImageIcon, PublishIcon, SparklesIcon, CopyIcon, CheckIcon, ErrorIcon } from './components/Icons';
import { PipelineStep } from './components/PipelineStep';
import { Loader } from './components/Loader';
import { detectTrend, generatePost, generateImage } from './services/geminiService';
import { AppState, LoadingState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    trend: null,
    post: null,
    imageUrl: null,
    error: null,
    step: 1,
    copied: false
  });

  const [loading, setLoading] = useState<LoadingState>({
    trend: false,
    post: false,
    image: false,
  });

  const handleDetectTrend = useCallback(async () => {
    setLoading(prev => ({ ...prev, trend: true }));
    setAppState(prev => ({ ...prev, error: null, trend: null, post: null, imageUrl: null, step: 1 }));
    try {
      const detectedTrend = await detectTrend();
      setAppState(prev => ({ ...prev, trend: detectedTrend, step: 2 }));
    } catch (e) {
      console.error(e);
      setAppState(prev => ({ ...prev, error: 'Failed to detect trend. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, trend: false }));
    }
  }, []);

  const handleGeneratePost = useCallback(async () => {
    if (!appState.trend) return;
    setLoading(prev => ({ ...prev, post: true }));
    setAppState(prev => ({ ...prev, error: null, post: null, imageUrl: null }));
    try {
      const generatedPost = await generatePost(appState.trend);
      setAppState(prev => ({ ...prev, post: generatedPost, step: 3 }));
    } catch (e) {
      console.error(e);
      setAppState(prev => ({ ...prev, error: 'Failed to generate post. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, post: false }));
    }
  }, [appState.trend]);

  const handleGenerateImage = useCallback(async () => {
    if (!appState.post) return;
    setLoading(prev => ({ ...prev, image: true }));
     setAppState(prev => ({ ...prev, error: null, imageUrl: null }));
    try {
      const generatedImageUrl = await generateImage(appState.post);
      setAppState(prev => ({ ...prev, imageUrl: generatedImageUrl, step: 4 }));
    } catch (e) {
      console.error(e);
      setAppState(prev => ({ ...prev, error: 'Failed to generate image. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  }, [appState.post]);

  const handlePublish = () => {
     // This is a simulation. In a real app, this would use the LinkedIn API.
     alert("Ready to Publish!\n\nYour post and image are ready. Please copy the content and upload the image to LinkedIn manually.\n\n(This is a simulation as direct publishing requires server-side authentication.)");
  };
  
  const handleCopyToClipboard = () => {
    if (appState.post) {
      navigator.clipboard.writeText(appState.post);
      setAppState(prev => ({ ...prev, copied: true }));
      setTimeout(() => setAppState(prev => ({ ...prev, copied: false })), 2000);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            LinkedIn AI Post Automator
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Automate your content creation pipeline from trend to publication.
          </p>
        </header>

        {appState.error && (
            <div className="bg-red-900/50 border border-red-600 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center">
              <ErrorIcon className="w-5 h-5 mr-3"/>
              <span>{appState.error}</span>
            </div>
        )}

        <div className="space-y-8">
          <PipelineStep 
            title="Detect Trending Topic" 
            icon={<TrendIcon />} 
            stepNumber={1} 
            isActive={appState.step >= 1}
            isCompleted={!!appState.trend}
          >
            <button
              onClick={handleDetectTrend}
              disabled={loading.trend}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading.trend ? <Loader /> : <><SparklesIcon className="w-5 h-5 mr-2" /> Find Trend</>}
            </button>
            {appState.trend && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="font-semibold text-indigo-400">Trending Topic:</p>
                <p className="text-lg text-white">{appState.trend}</p>
              </div>
            )}
          </PipelineStep>

          <PipelineStep 
            title="Generate LinkedIn Post" 
            icon={<PostIcon />} 
            stepNumber={2} 
            isActive={appState.step >= 2}
            isCompleted={!!appState.post}
            >
             <button
              onClick={handleGeneratePost}
              disabled={!appState.trend || loading.post || appState.step < 2}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading.post ? <Loader /> : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Post</>}
            </button>
             {appState.post && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg relative">
                 <button onClick={handleCopyToClipboard} className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                  {appState.copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-400" />}
                 </button>
                <p className="font-semibold text-indigo-400 mb-2">Generated Post:</p>
                <textarea
                  readOnly
                  value={appState.post}
                  className="w-full h-64 p-3 bg-gray-900 text-gray-300 rounded-md border border-gray-700 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </PipelineStep>

           <PipelineStep 
            title="Generate AI Image" 
            icon={<ImageIcon />} 
            stepNumber={3} 
            isActive={appState.step >= 3}
            isCompleted={!!appState.imageUrl}
            >
             <button
              onClick={handleGenerateImage}
              disabled={!appState.post || loading.image || appState.step < 3}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading.image ? <Loader /> : <><SparklesIcon className="w-5 h-5 mr-2" /> Create Image</>}
            </button>
            {loading.image && <p className="mt-4 text-sm text-gray-400">Image generation can take a minute. Please be patient...</p>}
            {appState.imageUrl && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="font-semibold text-indigo-400 mb-2">Generated Image:</p>
                <img src={appState.imageUrl} alt="AI generated" className="rounded-lg w-full max-w-md mx-auto shadow-lg"/>
              </div>
            )}
          </PipelineStep>

           <PipelineStep 
            title="Publish to LinkedIn" 
            icon={<PublishIcon />} 
            stepNumber={4} 
            isActive={appState.step >= 4}
            isCompleted={false}
            >
             <button
              onClick={handlePublish}
              disabled={!appState.imageUrl || appState.step < 4}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <PublishIcon className="w-5 h-5 mr-2" /> Publish
            </button>
            {appState.step >= 4 && (
                <p className="mt-4 text-sm text-gray-400">Click publish to get your content ready for LinkedIn.</p>
            )}
          </PipelineStep>
        </div>
      </div>
    </div>
  );
};

export default App;
