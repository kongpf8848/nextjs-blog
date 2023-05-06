---
title: '动态代理的实现与分析'
date: '2023-05-05'
---

# 什么是动态代理？
> **代理模式**(Proxy Pattern)是程序设计中的一种设计模式，定义为其他对象提供一种代理以控制对这个对象的访问。代理模式分为静态代理和动态代理，静态代理是手动创建或工具生成代理类的源码，动态代理则是在运行阶段动态生成代理类。

# 动态代理的实现
1. 创建被代理的接口和实现类，Java中的动态代理基于接口
2. 创建```InvocationHandler```接口的实现类，在```invoke```方法中实现代理逻辑
3. 通过```Proxy```类的静态方法```newProxyInstance(ClassLoader loader,Class<?>[] interfaces,InvocationHandler h)```创建代理对象
4. 使用代理对象

## 创建被代理的接口
```java
//Subject.java
public interface Subject {
    void hello(String str);
}

```
## 创建接口实现类
```java
//RealSubject.java
public class RealSubject implements Subject {
    @Override
    public void hello(String str) {
        System.out.println("hello: " + str);
    }
}
```
## 创建InvocationHandler接口实现类
```java

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class DynamicProxy implements InvocationHandler {

    private Object object;

    public DynamicProxy(Object object)
    {
        this.object = object;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable         
    {
        Object result=method.invoke(subject,args);
        return result;
    }
}

```
## 测试
```java
RealSubject realSubject = new RealSubject();
InvocationHandler handler = new DynamicProxy(realSubject);
Subject subject = (Subject) Proxy.newProxyInstance(Subject.class.getClassLoader(), new Class<?>[] { Subject.class }, handler);
subject.hello("jack");
```
输出结果为```hello: jack```

# 动态代理原理分析

动态代理是通过```Proxy```类的```newProxyInstance```方法动态创建代理对象，然后将接口方法"委托"给```InvocationHandler```实例完成的，```newProxyInstance```方法的定义如下：
```java
   public static Object newProxyInstance(ClassLoader loader,Class<?>[] interfaces,InvocationHandler h)
```
- ClassLoader：接口类对应的ClassLoader
- Class<?>[] ：代理类要实现的接口列表
- InvocationHandler: 方法调用处理类

对应的代码实现为：
```java
    /**
     * Returns an instance of a proxy class for the specified interfaces
     * that dispatches method invocations to the specified invocation
     * handler.
     */
   @CallerSensitive
    public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h)
        throws IllegalArgumentException
    {
        Objects.requireNonNull(h);

        final Class<?>[] intfs = interfaces.clone();
        final SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
            checkProxyAccess(Reflection.getCallerClass(), loader, intfs);
        }

        /*
         * Look up or generate the designated proxy class.
         */
        Class<?> cl = getProxyClass0(loader, intfs);

        /*
         * Invoke its constructor with the designated invocation handler.
         */
        try {
            if (sm != null) {
                checkNewProxyPermission(Reflection.getCallerClass(), cl);
            }

            final Constructor<?> cons = cl.getConstructor(constructorParams);
            final InvocationHandler ih = h;
            if (!Modifier.isPublic(cl.getModifiers())) {
                AccessController.doPrivileged(new PrivilegedAction<Void>() {
                    public Void run() {
                        cons.setAccessible(true);
                        return null;
                    }
                });
            }
            return cons.newInstance(new Object[]{h});
        } catch (IllegalAccessException|InstantiationException e) {
            throw new InternalError(e.toString(), e);
        } catch (InvocationTargetException e) {
            Throwable t = e.getCause();
            if (t instanceof RuntimeException) {
                throw (RuntimeException) t;
            } else {
                throw new InternalError(t.toString(), t);
            }
        } catch (NoSuchMethodException e) {
            throw new InternalError(e.toString(), e);
        }
    }
```
核心代码如下：
1. 找到代理类对于的Class
```java
 Class<?> cl = getProxyClass0(loader, intfs);
```
2. 通过反射获取代理类的构造函数，参数为```InvocationHandler```实例
```java
 private static final Class<?>[] constructorParams =
      { InvocationHandler.class };
 final Constructor<?> cons = cl.getConstructor(constructorParams);
```
3. 生成代理类的实例
```java
return cons.newInstance(new Object[]{h});
```

生成的动态代理类如下：

```java
//com.sun.proxy.$Proxy0.java
package com.sun.proxy;

import io.github.kongpf8848.pattern.proxy.Subject;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.UndeclaredThrowableException;

public final class $Proxy0 extends Proxy implements Subject {
    private static Method m1;
    private static Method m2;
    private static Method m3;
    private static Method m0;

    public $Proxy0(InvocationHandler var1) throws  {
        super(var1);
    }

    public final boolean equals(Object var1) throws  {
        try {
            return (Boolean)super.h.invoke(this, m1, new Object[]{var1});
        } catch (RuntimeException | Error var3) {
            throw var3;
        } catch (Throwable var4) {
            throw new UndeclaredThrowableException(var4);
        }
    }

    public final String toString() throws  {
        try {
            return (String)super.h.invoke(this, m2, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    public final void hello(String var1) throws  {
        try {
            super.h.invoke(this, m3, new Object[]{var1});
        } catch (RuntimeException | Error var3) {
            throw var3;
        } catch (Throwable var4) {
            throw new UndeclaredThrowableException(var4);
        }
    }

    public final int hashCode() throws  {
        try {
            return (Integer)super.h.invoke(this, m0, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    static {
        try {
            m1 = Class.forName("java.lang.Object").getMethod("equals", Class.forName("java.lang.Object"));
            m2 = Class.forName("java.lang.Object").getMethod("toString");
            m3 = Class.forName("io.github.kongpf8848.pattern.proxy.Subject").getMethod("hello", Class.forName("java.lang.String"));
            m0 = Class.forName("java.lang.Object").getMethod("hashCode");
        } catch (NoSuchMethodException var2) {
            throw new NoSuchMethodError(var2.getMessage());
        } catch (ClassNotFoundException var3) {
            throw new NoClassDefFoundError(var3.getMessage());
        }
    }
}
```
在该代理类中，通过反射找到代理接口的```hello```方法，当调用代理类的```hello```方法时，委托```InvocationHandler```实例去处理。

