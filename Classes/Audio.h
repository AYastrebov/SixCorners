//
//  Audio.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/23/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "SimpleAudioEngine.h"
#import "CDXPropertyModifierAction.h"
#import "CocosDenshion.h"

@interface Audio : NSObject 
{
	SimpleAudioEngine *sae;
	NSArray *soundFX;
	CDAudioManager *cda;
	NSInteger duration;
}

@property NSInteger duration;

- (void)playBackgroundMusic:(id)sender;
- (void)playMenuMusic:(id)sender;
- (void)FadeMusic;
- (void)stopMusic;
- (void)nextTrack:(id)sender;
- (void)pause;
- (void)resume;

@end
