---
layout: post
title:  "java programming"
date:   2017-08-18 15:14:54
categories: java
tags: java programming
excerpt: 
mathjax: true
---
问题：编程实现查找输入字符串[最大不重复子串长度]，如"ccccbc"最大子串为"cb"或"bc",所以长度为2
[java]代码:
import java.util.ArrayList;
import java.util.Scanner;

public class test3 {

	public static int lengthOfLongestSubstring(String s) {
		int index1=0;//定义首尾两个指针
		int index2=index1+1;
		ArrayList max=new ArrayList();//存放子串集合
		String ss=s.substring(0,1);//ss存放子串
		if(s.length()==1){//考虑字符串长度为1的情况
			max.add(ss);
		}
		while(index1<s.length()-1){		
			char b=s.charAt(index1);
			if(index2<s.length()){//防止尾指针超出界限
				b=s.charAt(index2);
			}
    		if(!ss.contains(String.valueOf(b))){	
    			ss+=String.valueOf(b);
    			index2++;    			
    			continue;
    		}//如果子串重复了就截断ss				
    			max.add(ss);
    			index1++;
    			index2=index1+1;
    			ss=String.valueOf(s.charAt(index1));   		
        }
		//遍历列表找到最大长度的子串
		int maxx=max.get(0).toString().length();
    	for(int i=0;i<max.size();i++){
    		System.out.println(max.get(i).toString());
    		if(max.get(i).toString().length()>maxx){
    			maxx=max.get(i).toString().length();
    		}
    	}		
    	return maxx;
	}
    public static void main(String[] args){
        Scanner in = new Scanner(System.in );
        int res;    
        String _s;
        try {
            _s = in.nextLine();
        } catch (Exception e) {
            _s = null;
        }
        res = lengthOfLongestSubstring(_s);
        System.out.println(res);    

    }
}

