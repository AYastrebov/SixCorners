//
//  Audio.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/23/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "Audio.h"
#import "_CornersAppDelegate.h"

@implementation Audio
@synthesize duration;

-(id) init
{
	if( (self=[super init] )) 
	{
		soundFX = [[_CornersAppDelegate sounds] retain];
		sae = [SimpleAudioEngine sharedEngine];
		cda = [CDAudioManager sharedManager];
		
		[sae setBackgroundMusicVolume:[_CornersAppDelegate musicVolume]];
		[sae setMute:[_CornersAppDelegate isMute]];
	} 
	return self;
}

- (void)stopMusic
{
	[sae stopBackgroundMusic];
}

- (void)FadeMusic
{
	[CDXPropertyModifierAction fadeBackgroundMusic:1.0f finalVolume:0.0f curveType:kIT_Exponential shouldStop:YES];
}

- (void)playMenuMusic:(id)sender
{
	if (![sae isBackgroundMusicPlaying]) 
	{
		[sae setBackgroundMusicVolume:[_CornersAppDelegate musicVolume]];
		[sae rewindBackgroundMusic];
		[sae playBackgroundMusic:[soundFX objectAtIndex:0] loop:YES];
	} 
	else 
	{
		[CDXPropertyModifierAction fadeBackgroundMusic:2.0f finalVolume:0.0f curveType:kIT_Exponential shouldStop:YES];
	}
}

- (void)nextTrack:(id)sender
{
	NSUInteger random = arc4random() % 4 + 1;
	NSString *soundName = [soundFX objectAtIndex:random];
	
	if (![_CornersAppDelegate isMute]) 
	{
		[sae stopBackgroundMusic];
		[sae setBackgroundMusicVolume:[_CornersAppDelegate musicVolume]];
		[sae rewindBackgroundMusic];
		[sae playBackgroundMusic:soundName];
		self.duration = cda.backgroundMusic.audioSourcePlayer.duration;
	}
}

- (void)pause
{
	[sae pauseBackgroundMusic];
}

- (void)resume
{
	[sae resumeBackgroundMusic];
}

- (void)playBackgroundMusic:(id)sender
{
	NSUInteger random = arc4random() % 4 + 1;
	NSString *soundName = [soundFX objectAtIndex:random];
	
	if (![sae isBackgroundMusicPlaying]) 
	{
		[sae setBackgroundMusicVolume:[_CornersAppDelegate musicVolume]];
		[sae rewindBackgroundMusic];
		[sae playBackgroundMusic:soundName];
		self.duration = cda.backgroundMusic.audioSourcePlayer.duration;
	} 
	else 
	{
		[CDXPropertyModifierAction fadeBackgroundMusic:2.0f finalVolume:0.0f curveType:kIT_Exponential shouldStop:YES];
	}
}

-(void) dealloc 
{
	sae = nil;
	[soundFX release];
	[super dealloc];
}	
@end
