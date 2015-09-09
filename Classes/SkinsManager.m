//
//  SkinsManager.m
//  6Corners
//
//  Created by Andrey Yastrebov on 3/5/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "SkinsManager.h"
#import "_CornersAppDelegate.h"

@implementation SkinsManager

+ (NSString *)skinBundlePath:(NSUInteger)skin
{
	return [NSString stringWithFormat:@"Skin_%d_%@.bundle", skin, [SkinsManager currentLocale]];
}

+ (NSString *)currentBundlePath
{
	return [SkinsManager skinBundlePath:[_CornersAppDelegate selectedSkin]];
}

+ (NSString *)currentLocale
{
	NSString * language = [[NSLocale preferredLanguages] objectAtIndex:0];
	
	if (![language isEqualToString:@"en"]) 
	{
		return @"en";
	}
	else 
	{
		return language;
	}
}

+ (NSString *)figuresPath
{
	return [NSString stringWithFormat:@"%@/Figures", [SkinsManager currentBundlePath]];
}

+ (NSString *)fontsPath
{
	return [NSString stringWithFormat:@"%@/Fonts", [SkinsManager currentBundlePath]];
}

+ (NSString *)gameFieldPath
{
	return [NSString stringWithFormat:@"%@/Gamefield", [SkinsManager currentBundlePath]];
}

+ (NSString *)menuPath
{
	return [NSString stringWithFormat:@"%@/Menu", [SkinsManager currentBundlePath]];
}

+ (NSString *)menuButtonsPath
{
	return [NSString stringWithFormat:@"%@/Buttons", [SkinsManager menuPath]];
}

+ (NSString *)hexMapPath
{
	return [NSString stringWithFormat:@"%@/hexmap", [SkinsManager currentBundlePath]];
}

+ (NSUInteger)currentSkin
{
	return [_CornersAppDelegate selectedSkin];
}

@end
